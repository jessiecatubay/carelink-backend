import { gemini } from "../lib/gemini";

export type AIMessage = {
  role: "user" | "model";
  text: string;
};

export type PatientMedicationContext = {
  patientId?: string;
  patientName?: string;
  age?: number | null;
  gender?: string | null;
  medicalConditions?: string | null;
  notes?: string | null;
  currentDayName: string;
  currentDateFormatted: string;
  pillReminders: Array<{
    id: string;
    title: string;
    description: string | null;
    timeString: string | null;
    scheduledAt: Date;
    daysOfWeek: number[];
    status: string;
    isScheduledForToday: boolean;
  }>;
};

const CHAT_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-3.8-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
  "gemini-3.1-flash-lite",
  "gemini-3.1-flash-image",
  "gemini-3.1-flash-lite-image",
  "gemini-3-pro-image",
  "gemini-3.1-pro-preview",
  "gemini-3-flash-preview",
  "gemini-3.5-live-translate-preview",
  "gemini-3.1-flash-live-preview",
  "gemini-3.1-flash-tts-preview",
  "gemini-omni-1.1-flash",
  "gemini-3.5-transcribe",
  "gemini-3.5-transcribe-live",
];

const SYSTEM_INSTRUCTION = `
You are Carelink, an AI assistant inside the CareLink elderly-care application.

Your purpose is to help caregivers and non-patient users provide safe basic assistance to elderly patients.

You may:
- Provide general first-aid information.
- Explain common symptoms and warning signs.
- Give basic emergency-response guidance.
- Explain what caregivers should generally do while waiting for professional medical help.
- Help caregivers understand general patient-care information.
- Answer questions about the patient's scheduled medications using the patient's database records provided to you.

Important safety rules:
- Do NOT prescribe or recommend new unprescribed medications or suggest arbitrary medication dosages.
- Do NOT tell the user to alter doctor-prescribed medication dosages without physician approval.
- Do NOT diagnose a medical condition.
- Do NOT claim certainty about a patient's condition.
- If symptoms may indicate a serious or life-threatening emergency, advise the user to contact local emergency services or a qualified healthcare professional.
- For suspected stroke, heart attack, severe breathing difficulty, unconsciousness, severe bleeding, or other potentially life-threatening situations, prioritize emergency medical assistance.
- Keep responses clear and practical for caregivers.
- Do not pretend that you can see the patient's current vital signs unless those values are explicitly provided to you.
- Your name is Carelink.
`;

export async function getCarelinkResponse(
  messages: AIMessage[],
  patientContext?: PatientMedicationContext,
): Promise<string> {
  const contents = messages.map((message) => ({
    role: message.role,
    parts: [
      {
        text: message.text,
      },
    ],
  }));

  let systemInstruction = SYSTEM_INSTRUCTION;

  if (patientContext) {
    const todayReminders = patientContext.pillReminders.filter(
      (r) => r.isScheduledForToday,
    );

    let pillsSummaryText = "";

    if (patientContext.pillReminders.length === 0) {
      pillsSummaryText = `There are NO pill reminders or scheduled medications recorded in the database for ${patientContext.patientName || "this patient"}.`;
    } else {
      pillsSummaryText = `TODAY'S MEDICATIONS SCHEDULED FOR ${patientContext.patientName?.toUpperCase() || "THE PATIENT"} (${patientContext.currentDayName}, ${patientContext.currentDateFormatted}):\n`;

      if (todayReminders.length === 0) {
        pillsSummaryText += `- No medications are scheduled to be taken today (${patientContext.currentDayName}).\n`;
      } else {
        todayReminders.forEach((r, idx) => {
          pillsSummaryText += `${idx + 1}. **${r.title}**
   - Scheduled Time: ${r.timeString || r.scheduledAt.toLocaleTimeString()}
   - Instructions / Notes: ${r.description || "None specified"}
   - Status: ${r.status}\n`;
        });
      }

      pillsSummaryText += `\nALL REGISTERED MEDICATIONS IN PATIENT'S DATABASE (${patientContext.pillReminders.length} total):\n`;
      patientContext.pillReminders.forEach((r, idx) => {
        const daysLabel =
          r.daysOfWeek && r.daysOfWeek.length > 0
            ? r.daysOfWeek
                .map(
                  (d) =>
                    ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d] || "",
                )
                .filter(Boolean)
                .join(", ")
            : "Specific / One-time Date";

        pillsSummaryText += `${idx + 1}. **${r.title}** (Time: ${r.timeString || r.scheduledAt.toLocaleTimeString()}, Days: ${daysLabel})
   - Dosage/Notes: ${r.description || "None"}
   - Status: ${r.status}\n`;
      });
    }

    systemInstruction += `

=======================================================
PATIENT & PILL REMINDER DATABASE CONTEXT
=======================================================
Patient Name: ${patientContext.patientName || "Connected Patient"}
Age: ${patientContext.age ?? "Not specified"} | Gender: ${patientContext.gender ?? "Not specified"}
Medical Conditions: ${patientContext.medicalConditions || "None recorded"}
Caregiver Notes: ${patientContext.notes || "None recorded"}
Current Date & Time Today: ${patientContext.currentDateFormatted} (${patientContext.currentDayName})

${pillsSummaryText}

SPECIFIC INSTRUCTIONS FOR PILL & MEDICATION INQUIRIES:
- When the caregiver/nonpatient asks what medication to take today (or in this day), what pills the patient needs, or about their medication schedule, provide a clear, warm, organized breakdown based on the database records above.
- Specifically list each medication title, scheduled time, and any instructions/dosage notes stored in the database.
- If there are NO medications scheduled for today, clearly inform the caregiver that no medications are scheduled in the CareLink database for today (${patientContext.currentDayName}).
- If there are NO pill reminders in the database for the patient at all, state that no pill reminders are currently registered in the database for ${patientContext.patientName || "this patient"}.
- Always remind the caregiver to follow the prescribing physician's or pharmacist's specific medical instructions and to verify if unsure.
=======================================================
`;
  }

  let lastError: unknown = null;

  for (const model of CHAT_MODELS) {
    try {
      console.log(`Carelink trying model: ${model}`);

      const response = await gemini.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });


      const text = response.text?.trim();

      if (!text) {
        throw new Error(`Model ${model} returned an empty response`);
      }

      console.log(`Carelink successfully responded using: ${model}`);

      return text;
    } catch (error) {
      lastError = error;

      console.error(
        `Carelink model failed: ${model}`,
        error,
      );
    }
  }

  console.error("All Carelink AI models failed.", lastError);

  throw new Error(
    "Carelink is temporarily unavailable because all AI models failed.",
  );
}
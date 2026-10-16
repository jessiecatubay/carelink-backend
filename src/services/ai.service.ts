import { gemini } from "../lib/gemini";

export type AIMessage = {
  role: "user" | "model";
  text: string;
};

export type PatientMedicationContext = {
  isConnected: boolean;
  connectionStatus?: string;
  isOnline?: boolean;
  lastSeen?: string;
  hasDevice?: boolean;
  deviceId?: string;
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

    if (!patientContext.isConnected) {
      systemInstruction += `

=======================================================
PATIENT CONNECTION STATUS
=======================================================
STATUS: NO PATIENT IS CURRENTLY CONNECTED TO THIS CAREGIVER.
- The caregiver has not linked, paired, or connected with any patient account yet.
- If the user asks whether a patient is connected (e.g. "is my patient connected?", "do I have a patient connected?", "who is my patient?", or asks about their patient's vitals or medications):
  Politely and clearly explain:
  "You do not have any patient connected to your account right now. To connect with a patient, ask the patient to show their CareLink connection QR code from their device, then scan it or pair with them on your dashboard."
=======================================================
`;
    } else {
      systemInstruction += `

=======================================================
PATIENT CONNECTION & LIVE STATUS
=======================================================
STATUS: A PATIENT IS CURRENTLY CONNECTED TO THIS CAREGIVER.
- Connected Patient: **${patientContext.patientName || "Connected Patient"}**
- Pairing Status in System: CONNECTED
- Live App Status: ${patientContext.isOnline ? "ONLINE (Active in the CareLink app right now)" : "OFFLINE (App is closed or inactive)"}
${patientContext.lastSeen ? `- Last Active in App: ${patientContext.lastSeen}` : ""}
- CareLink Wrist Monitor: ${patientContext.hasDevice ? `Registered (Device ID: ${patientContext.deviceId})` : "No wrist device registered yet"}

CONNECTION STATUS INSTRUCTIONS:
- If the caregiver asks if their patient is connected (e.g., "is my patient connected?", "is ${patientContext.patientName || "my patient"} connected?", "are they online?"):
  1. Confirm clearly that **${patientContext.patientName || "your patient"}** IS connected to their caregiver account.
  2. State their live app status (${patientContext.isOnline ? "currently online and active" : "currently offline or inactive"}).
  3. Mention their CareLink wrist device status (${patientContext.hasDevice ? `wrist device ${patientContext.deviceId} is registered` : "no wrist device registered yet"}).
=======================================================
`;
    }
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
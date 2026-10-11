import { prisma } from "@/lib/prisma";
import { gemini } from "@/lib/gemini";

export interface VitalInsightData {
  latestHeartRate: number | null;
  latestTemperature: number | null;
  heartRateTrend: "STABLE" | "ELEVATED" | "LOW" | "FLUCTUATING" | "UNKNOWN";
  temperatureTrend: "NORMAL" | "FEVER" | "LOW" | "UNKNOWN";
  observation: string;
}

export interface FirstAidStep {
  step: number;
  title: string;
  instruction: string;
}

export interface EmergencyIncidentAdvisoryResult {
  patientId: string;
  patientName: string;
  age?: number | null;
  gender?: string | null;
  medicalConditions?: string | null;
  vitalsCount: number;
  recentVitals: {
    recordedAt: string;
    heartRate: number;
    temperature: number;
    sensorContact: boolean;
  }[];
  assessmentSummary: string;
  vitalInsights: VitalInsightData;
  priorityLevel: "CRITICAL" | "HIGH" | "MODERATE";
  firstAidSteps: FirstAidStep[];
  caregiverPrecautions: string[];
  paramedicBriefing: string;
  generatedAt: string;
}

const EMERGENCY_AI_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
];

const EMERGENCY_SYSTEM_PROMPT = `
You are Carelink AI Incident Advisory, an emergency-response guidance engine in the CareLink elderly care system.
Your mission is to instantly analyze the last 10 vital readings from an elderly patient during an active emergency alert and provide immediate, high-priority, step-by-step first-aid and caregiver instructions.

Key Medical & Safety Rules:
1. You are advising a non-patient (caregiver or family member) who is responding to the emergency.
2. Prioritize life safety: Airway, Breathing, Circulation, Consciousness, and fall protection.
3. Keep instructions concise, numbered, direct, and actionable in an urgent situation.
4. Do NOT prescribe medications or medical dosages.
5. Emphasize that professional emergency services (911 / EMS) should be contacted immediately if the patient is unresponsive, complaining of chest pain, having severe shortness of breath, or bleeding heavily.
6. Provide a concise 1-2 sentence "paramedicBriefing" that the caregiver can read directly to paramedics or emergency dispatchers when they arrive.
7. Return ONLY valid JSON conforming to the requested schema.
8. If NO vital readings are present in the database for the specific patient who requested the emergency, you MUST explicitly state in assessmentSummary and vitalInsights that no vital readings are recorded in the database for that patient, and guide the caregiver to evaluate the patient's breathing, pulse, and responsiveness manually.
`;

export async function generateEmergencyAdvisory(params: {
  patientId?: string;
  deviceId?: string;
  caregiverId?: string;
}): Promise<EmergencyIncidentAdvisoryResult> {
  let targetPatientId = params.patientId;

  if (!targetPatientId && params.caregiverId) {
    const connection = await prisma.patientNonPatient.findFirst({
      where: {
        nonPatientId: params.caregiverId,
        status: "CONNECTED",
      },
      orderBy: { currentPatient: "desc" },
      select: { patientId: true },
    });
    targetPatientId = connection?.patientId;
  }

  if (!targetPatientId) {
    throw new Error("Target patient ID could not be identified");
  }

  // 1. Fetch patient and profile information
  const patient = await prisma.user.findUnique({
    where: { id: targetPatientId },
    include: {
      patientProfile: true,
    },
  });


  const patientName =
    [patient?.firstName, patient?.lastName].filter(Boolean).join(" ").trim() ||
    "Connected Patient";

  const age = patient?.patientProfile?.age ?? null;
  const gender = patient?.patientProfile?.gender ?? null;
  const medicalConditions =
    patient?.patientProfile?.medicalConditions ?? null;
  const notes = patient?.patientProfile?.notes ?? null;

  // 2. Determine device ID
  let targetDeviceId =
    params.deviceId || patient?.patientProfile?.deviceOwned || null;

  if (!targetDeviceId) {
    const latestCommand = await prisma.commands.findFirst({
      where: {
        patientId: targetPatientId,
        deviceId: { not: null },
      },
      orderBy: { recordedAt: "desc" },
      select: { deviceId: true },
    });
    targetDeviceId = latestCommand?.deviceId ?? null;
  }

  // 3. Fetch 10 most recent vital readings strictly for this specific patient from database
  const vitals = await prisma.vitalReadings.findMany({
    where: { patientId: targetPatientId },
    take: 10,
    orderBy: { recordedAt: "desc" },
    select: {
      id: true,
      deviceId: true,
      patientId: true,
      temperature: true,
      heartRate: true,
      sensorContact: true,
      recordedAt: true,
    },
  });

  const hasVitals = vitals.length > 0;
  const latestVital = vitals[0] || null;
  const latestHeartRate = latestVital ? latestVital.heartRate : null;
  const latestTemperature = latestVital ? latestVital.temperature : null;

  // Format vitals summary for the prompt
  const formattedVitalsList = vitals.map((v, idx) => ({
    readingIndex: idx + 1,
    time: v.recordedAt.toISOString(),
    heartRateBPM: v.heartRate,
    bodyTemperatureCelsius: v.temperature,
    sensorAttached: v.sensorContact,
  }));

  const vitalsContextAndInstructions = hasVitals
    ? `Recent 10 Vitals Readings for ${patientName} (latest first):
${JSON.stringify(formattedVitalsList, null, 2)}

Instructions:
1. Examine the 10 vital readings for ${patientName} (heart rate range, temperature range, sudden changes or stability).
2. Determine vital trend (e.g., Tachycardia if HR > 100, Bradycardia if HR < 60, Fever if Temp > 37.5°C, Hypothermia if Temp < 35.0°C).
3. Provide step-by-step first-aid and care instructions for the caregiver tailored to these vitals.`
    : `DATABASE STATUS FOR THIS PATIENT:
CRITICAL: There are NO vital readings present in the database with the patient's ID for ${patientName} (Patient ID: ${targetPatientId}) who requested this emergency alert.

CRITICAL INSTRUCTIONS:
1. In "assessmentSummary", you MUST explicitly state that no vital readings of ${patientName} (who requested the emergency) are recorded in the database (e.g.: "No vital readings are recorded in the database for ${patientName}, who requested this emergency alert. Immediate manual check of responsiveness, airway, and breathing is required.").
2. In "vitalInsights", set latestHeartRate to null, latestTemperature to null, heartRateTrend to "UNKNOWN", temperatureTrend to "UNKNOWN", and observation to "No vital readings for ${patientName} are present in the database. Vital telemetry is currently unavailable for this patient."
3. In "firstAidSteps", provide step-by-step first aid prioritizing manual visual and physical assessment: check consciousness/responsiveness, check airway and breathing, check radial/carotid pulse manually, position safely, and prepare to call 911 if non-responsive.`;

  const userPrompt = `
Emergency Alert Triggered for Patient:
- Name: ${patientName}
- Age: ${age ?? "Unknown"}
- Gender: ${gender ?? "Unknown"}
- Medical Conditions: ${medicalConditions || "None recorded"}
- Additional Notes: ${notes || "None"}
- Total Recent Vitals in Database for ${patientName}: ${vitals.length}

${vitalsContextAndInstructions}

Output JSON with the exact following structure:
{
  "assessmentSummary": "1-2 sentence assessment",
  "vitalInsights": {
    "latestHeartRate": ${latestHeartRate ?? "null"},
    "latestTemperature": ${latestTemperature ?? "null"},
    "heartRateTrend": "${hasVitals ? "STABLE | ELEVATED | LOW | FLUCTUATING | UNKNOWN" : "UNKNOWN"}",
    "temperatureTrend": "${hasVitals ? "NORMAL | FEVER | LOW | UNKNOWN" : "UNKNOWN"}",
    "observation": "Observation regarding vitals status"
  },
  "priorityLevel": "CRITICAL" | "HIGH" | "MODERATE",
  "firstAidSteps": [
    {
      "step": 1,
      "title": "Short title",
      "instruction": "Actionable explanation for caregiver"
    }
  ],
  "caregiverPrecautions": [
    "Precaution point 1",
    "Precaution point 2"
  ],
  "paramedicBriefing": "Concise statement for the caregiver to tell first responders."
}
`;

  let aiParsedResponse: any = null;

  for (const model of EMERGENCY_AI_MODELS) {
    try {
      console.log(`Carelink Emergency AI invoking model: ${model}`);

      const response = await gemini.models.generateContent({
        model,
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        config: {
          systemInstruction: EMERGENCY_SYSTEM_PROMPT,
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text?.trim();
      if (responseText) {
        aiParsedResponse = JSON.parse(responseText);
        console.log(`Carelink Emergency AI successfully generated with ${model}`);
        break;
      }
    } catch (err) {
      console.error(`Carelink Emergency AI model ${model} failed:`, err);
    }
  }

  // Fallback if AI call failed or returned empty
  if (!aiParsedResponse) {
    console.warn("Using rule-based fallback emergency advisory");

    const isHrHigh = latestHeartRate !== null && latestHeartRate > 100;
    const isHrLow = latestHeartRate !== null && latestHeartRate < 60;
    const isTempHigh = latestTemperature !== null && latestTemperature >= 38.0;

    aiParsedResponse = {
      assessmentSummary: hasVitals
        ? `Emergency alert received. Analyzed ${vitals.length} recent vitals for ${patientName}. Latest Heart Rate: ${latestHeartRate ?? "N/A"} BPM, Temperature: ${latestTemperature ?? "N/A"}°C.`
        : `No vital readings are recorded in the database for ${patientName}, who requested this emergency alert. Immediate manual check of responsiveness, airway, and breathing is required.`,
      vitalInsights: {
        latestHeartRate,
        latestTemperature,
        heartRateTrend: isHrHigh ? "ELEVATED" : isHrLow ? "LOW" : latestHeartRate ? "STABLE" : "UNKNOWN",
        temperatureTrend: isTempHigh ? "FEVER" : latestTemperature ? "NORMAL" : "UNKNOWN",
        observation: hasVitals
          ? (isHrHigh ? `Elevated heart rate detected during alert for ${patientName}.` : "Maintain continuous vital observation while assisting.")
          : `No vital readings for ${patientName} are present in the database.`,
      },
      priorityLevel: "CRITICAL",
      firstAidSteps: hasVitals
        ? [
            {
              step: 1,
              title: "Verify Responsiveness & Clear Airway",
              instruction: "Approach calmly. Speak loudly to the patient and check if they are conscious, responsive, and breathing normally.",
            },
            {
              step: 2,
              title: "Safe Patient Positioning",
              instruction: "If conscious and short of breath, assist them into a comfortable upright sitting position. If faint or dizzy, elevate legs slightly unless injured.",
            },
            {
              step: 3,
              title: "Loosen Constrictive Clothing",
              instruction: "Loosen buttons, collars, and belts around the neck and chest to facilitate easy breathing.",
            },
            {
              step: 4,
              title: "Prepare for Emergency Dispatch",
              instruction: "If patient has chest tightness, difficulty breathing, or slurred speech, immediately slide to call 911.",
            },
          ]
        : [
            {
              step: 1,
              title: "Check Patient Responsiveness & Airway",
              instruction: `Because no telemetry readings are recorded in the database for ${patientName}, immediately approach and check if they respond to verbal questions or light shoulder taps.`,
            },
            {
              step: 2,
              title: "Manual Breathing & Pulse Assessment",
              instruction: "Look for continuous chest rise and fall. Manually place two fingers on the wrist or side of the neck to verify heartbeat rate and regularity.",
            },
            {
              step: 3,
              title: "Ensure Safe Supportive Positioning",
              instruction: "If conscious, support them in a semi-seated position. If unresponsive but breathing, place them in the recovery position to keep the airway clear.",
            },
            {
              step: 4,
              title: "Slide to Call 911 if Distressed",
              instruction: "If the patient shows altered mental state, severe breathlessness, or chest discomfort, immediately slide to call 911.",
            },
          ],
      caregiverPrecautions: [
        "Do not leave the patient unattended until stabilized or help arrives.",
        "Do not administer oral fluids or medications if the patient is drowsy or choking.",
        hasVitals
          ? "Keep the CareLink sensor attached to monitor ongoing vital updates."
          : `Check device attachment as no vital telemetry is logged for ${patientName}.`,
      ],
      paramedicBriefing: hasVitals
        ? `${patientName} triggered an emergency alert. Latest recorded vitals: HR ${latestHeartRate ?? "N/A"} BPM, Temp ${latestTemperature ?? "N/A"}°C. Patient is currently monitored.`
        : `${patientName} triggered an emergency alert. No vital readings are recorded in the database for this patient; manual assessment in progress.`,
    };
  }

  return {
    patientId: targetPatientId,
    patientName,
    age,
    gender,
    medicalConditions,
    vitalsCount: vitals.length,
    recentVitals: vitals.map((v) => ({
      recordedAt: v.recordedAt.toISOString(),
      heartRate: v.heartRate,
      temperature: v.temperature,
      sensorContact: v.sensorContact,
    })),
    assessmentSummary: aiParsedResponse.assessmentSummary || "Emergency context analyzed.",
    vitalInsights: {
      latestHeartRate: aiParsedResponse.vitalInsights?.latestHeartRate ?? latestHeartRate,
      latestTemperature: aiParsedResponse.vitalInsights?.latestTemperature ?? latestTemperature,
      heartRateTrend: aiParsedResponse.vitalInsights?.heartRateTrend ?? "UNKNOWN",
      temperatureTrend: aiParsedResponse.vitalInsights?.temperatureTrend ?? "UNKNOWN",
      observation: aiParsedResponse.vitalInsights?.observation ?? "",
    },
    priorityLevel: aiParsedResponse.priorityLevel || "HIGH",
    firstAidSteps: Array.isArray(aiParsedResponse.firstAidSteps)
      ? aiParsedResponse.firstAidSteps
      : [],
    caregiverPrecautions: Array.isArray(aiParsedResponse.caregiverPrecautions)
      ? aiParsedResponse.caregiverPrecautions
      : [],
    paramedicBriefing: aiParsedResponse.paramedicBriefing || "",
    generatedAt: new Date().toISOString(),
  };
}

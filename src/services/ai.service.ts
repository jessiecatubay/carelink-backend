import { gemini } from "../lib/gemini";

export type AIMessage = {
  role: "user" | "model";
  text: string;
};

const CHAT_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.8-live",
  "gemini-3.8-live-extended-thinking",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
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

Important safety rules:
- Do NOT prescribe, recommend, or suggest medications or medication dosages.
- Do NOT tell the user to start, stop, increase, or decrease a medication.
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
): Promise<string> {
  const contents = messages.map((message) => ({
    role: message.role,
    parts: [
      {
        text: message.text,
      },
    ],
  }));

  let lastError: unknown = null;

  for (const model of CHAT_MODELS) {
    try {
      console.log(`Carelink trying model: ${model}`);

      const response = await gemini.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
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
import { randomInt } from "crypto";

export function generateCode(): string {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";

  for (let i = 0; i < 6; i++) {
    code += characters.charAt(randomInt(0, characters.length));
  }

  return code;
}


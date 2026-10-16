import { UserRepository } from "@/repositories/user.repository";

export async function CheckEmailService(email: string) {
  const userRepository = new UserRepository();

  try {
    const normalizedEmail = (email || "").trim().toLowerCase();

    if (!normalizedEmail) {
      return {
        code: 400,
        status: "error",
        message: "Email is required",
      };
    }

    const existingUser = await userRepository.findByEmail(normalizedEmail);

    if (existingUser) {
      return {
        code: 409,
        status: "error",
        message: "Email already existed",
      };
    }

    return {
      code: 200,
      status: "success",
      message: "Email is available",
    };
  } catch (error) {
    console.error("Check email error:", error);
    return {
      code: 500,
      status: "error",
      message: "Unable to check email availability",
    };
  }
}

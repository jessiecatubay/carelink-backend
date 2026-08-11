import { Role } from "@/generated/prisma/browser";
import { UserRepository } from "../../repositories/user.repository";

export async function UserOnboardingService(email: string, role: Role) {
  const userRepository = new UserRepository();
  
  try {
    const user = await userRepository.findByEmail(email);
    
    if (!user) {
      return {
        code: 404,
        status: "error",
        message: "User not found"
      };
    }

    const updateData = {
      role: role.toUpperCase() as Role,
    }

    console.log(role)

    const data = await userRepository.update(email, updateData);
    await userRepository.onBoardUser(email);

    return { code: 200, status: "success", message: "User onboarded successfully", data: data};
  } catch (error) {
    console.error("Error occurred while onboarding user:", error);
    return { code: 500, status: "error", message: "Unable to onboard user" }
  }
}
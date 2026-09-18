import { UserRepository } from "@/repositories/user.repository";
export async function UpdateUserService(email, data) {
    const userRepository = new UserRepository();
    try {
        await userRepository.update(email, data);
        return {
            code: 200,
            status: "success",
            message: "User updated successfully"
        };
    }
    catch (error) {
        console.error(error);
        return { code: 500, status: "error", message: "Unable to update account" };
    }
}
//# sourceMappingURL=update-service.js.map
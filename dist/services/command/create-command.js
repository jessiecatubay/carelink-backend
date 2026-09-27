import { CommandRepository } from "@/repositories/command.repository";
export async function CreateCommandService(deviceId, command, patientId, nonPatientId) {
    const commandRepository = new CommandRepository();
    try {
        const result = await commandRepository.create({
            deviceId,
            command,
            patientId,
            nonPatientId
        });
        return {
            code: 201,
            status: "success",
            message: "Successfully added command data",
            data: result,
        };
    }
    catch (error) {
        return {
            code: 500,
            status: "error",
            message: "Unable to add command data",
        };
    }
}
//# sourceMappingURL=create-command.js.map
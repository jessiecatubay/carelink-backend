import { CommandRepository } from "@/repositories/command.repository";
export async function GetLatestCommandService(nonPatientId, patientId) {
    const commandReposiotry = new CommandRepository();
    try {
        if (!nonPatientId) {
            return {
                code: 500,
                status: "error",
                message: "Missing nonPatientId",
            };
        }
        const result = await commandReposiotry.findLatest(nonPatientId, patientId);
        return {
            code: 200,
            status: "success",
            message: "Successfully fetched data",
            data: result
        };
    }
    catch (error) {
        return {
            code: 500,
            status: "error",
            message: "Unable to fetch data"
        };
    }
}
//# sourceMappingURL=get-latest-command.js.map
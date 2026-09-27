import { GetAllCommandService, GetLatestCommandService, GetRecentCommandService, } from "@/services/command";
import { parsePagination } from "@/utils/pagination";
export class CommandController {
    getAllCommandHistory = async (req, res) => {
        if (!req?.user?.id)
            return;
        const pagination = parsePagination(req.query);
        if ("error" in pagination) {
            return res
                .status(400)
                .json({ success: false, message: pagination.error });
        }
        const result = await GetAllCommandService(req.user.id, pagination);
        res.status(result.code).json(result);
    };
    getLatestCommand = async (req, res) => {
        const { patientId, nonPatientId } = req.body;
        const result = await GetLatestCommandService(nonPatientId, patientId);
        res.status(result.code).json(result);
    };
    getRecentCommands = async (req, res) => {
        const { patientId, nonPatientId } = req.body;
        console.log(req.body);
        const result = await GetRecentCommandService(nonPatientId, patientId);
        res.status(result.code).json(result);
    };
}
//# sourceMappingURL=command.controller.js.map
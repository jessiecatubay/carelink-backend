import { GenerateConnectionCodeService, UpdatePatientProfileService } from "@/services/patientProfile";
import { RegisterDeviceOwnedService } from "@/services/patientProfile";
export class UpdatePatientProfileController {
    update = async (req, res) => {
        const { patientId, ...data } = req.body;
        const result = await UpdatePatientProfileService(patientId, data);
        return res.status(result.code).json(result);
    };
    generateConnectionCode = async (req, res) => {
        const { id } = req.body;
        const result = await GenerateConnectionCodeService(id);
        return res.status(result.code).json(result);
    };
    registerDeviceOwned = async (req, res) => {
        const { deviceId } = req.body;
        if (!req?.user?.id)
            return;
        const result = await RegisterDeviceOwnedService(req.user.id, deviceId);
        return res.status(result.code).json(result);
    };
}
//# sourceMappingURL=patient-profile.controller.js.map
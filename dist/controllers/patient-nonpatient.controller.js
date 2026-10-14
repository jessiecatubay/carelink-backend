import { ConnectPatientNonpatientService, FindConnectedCaregiversService, FindConnectedNonpatientService, FindConnectedPatientService, PreviewPatientByCodeService, UpdatePatientNonpatientService, } from "../services/patientNonpatient/index.js";
export class PatientNonpatientController {
    previewPatient = async (req, res) => {
        const { connectionCode } = req.body;
        const result = await PreviewPatientByCodeService(connectionCode);
        return res.status(result.code).json(result);
    };
    connect = async (req, res) => {
        const nonPatientId = req.user?.id || req.body?.nonPatientId;
        const { connectionCode, relationship } = req.body;
        if (!nonPatientId) {
            return res.status(401).json({
                code: 401,
                status: "error",
                message: "Unauthorized. Session required.",
            });
        }
        const result = await ConnectPatientNonpatientService(nonPatientId, connectionCode, relationship);
        return res.status(result.code).json(result);
    };
    findConnectedPatient = async (req, res) => {
        const nonPatientId = req.user?.id || req.body?.nonPatientId;
        if (!nonPatientId) {
            return res.status(401).json({
                code: 401,
                status: "error",
                message: "Unauthorized. Session required.",
            });
        }
        const result = await FindConnectedPatientService(nonPatientId);
        return res.status(result.code).json(result);
    };
    findConnectedNonPatient = async (req, res) => {
        const patientId = req.user?.id || req.body?.userId;
        if (!patientId) {
            return res.status(401).json({
                code: 401,
                status: "error",
                message: "Unauthorized. Session required.",
            });
        }
        const result = await FindConnectedNonpatientService(patientId);
        return res.status(result.code).json(result);
    };
    findConnectedCaregivers = async (req, res) => {
        const patientId = req.user?.id || req.body?.patientId || req.body?.userId;
        if (!patientId) {
            return res.status(401).json({
                code: 401,
                status: "error",
                message: "Unauthorized. Session required.",
            });
        }
        const result = await FindConnectedCaregiversService(patientId);
        return res.status(result.code).json(result);
    };
    update = async (req, res) => {
        const currentUserId = req.user?.id;
        const { patientId, nonPatientId, ...data } = req.body;
        // Verify current user is either the patient or the caregiver involved
        if (currentUserId && currentUserId !== patientId && currentUserId !== nonPatientId) {
            return res.status(403).json({
                code: 403,
                status: "error",
                message: "Forbidden. You cannot modify connections for other users.",
            });
        }
        const result = await UpdatePatientNonpatientService(patientId, nonPatientId, data);
        return res.status(result.code).json(result);
    };
}
//# sourceMappingURL=patient-nonpatient.controller.js.map
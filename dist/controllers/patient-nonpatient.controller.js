import { ConnectPatientNonpatientService, FindConnectedCaregiversService, FindConnectedNonpatientService, FindConnectedPatientService, PreviewPatientByCodeService, UpdatePatientNonpatientService, } from "../services/patientNonpatient/index.js";
export class PatientNonpatientController {
    previewPatient = async (req, res) => {
        const { connectionCode } = req.body;
        const result = await PreviewPatientByCodeService(connectionCode);
        return res.status(result.code).json(result);
    };
    connect = async (req, res) => {
        const { connectionCode, nonPatientId, relationship } = req.body;
        const result = await ConnectPatientNonpatientService(nonPatientId, connectionCode, relationship);
        return res.status(result.code).json(result);
    };
    findConnectedPatient = async (req, res) => {
        const { nonPatientId } = req.body;
        console.log("fafoaijwefoinasdlkfas", req.body);
        const result = await FindConnectedPatientService(nonPatientId);
        return res.status(result.code).json(result);
    };
    findConnectedNonPatient = async (req, res) => {
        console.log(req.body);
        const result = await FindConnectedNonpatientService(req.body.userId);
        return res.status(result.code).json(result);
    };
    findConnectedCaregivers = async (req, res) => {
        const patientId = req.body.patientId || req.body.userId || req.user?.id;
        const result = await FindConnectedCaregiversService(patientId);
        return res.status(result.code).json(result);
    };
    update = async (req, res) => {
        const { patientId, nonPatientId, ...data } = req.body;
        console.log(req.body);
        console.log(data);
        const result = await UpdatePatientNonpatientService(patientId, nonPatientId, data);
        return res.status(result.code).json(result);
    };
}
//# sourceMappingURL=patient-nonpatient.controller.js.map
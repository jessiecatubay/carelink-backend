import { ConnectPatientNonpatientService, FindConnectedNonpatientService, UpdatePatientNonpatientService, } from "@/services/patientNonpatient";
export class PatientNonpatientController {
    connect = async (req, res) => {
        const { connectionCode, nonPatientId } = req.body;
        const result = await ConnectPatientNonpatientService(nonPatientId, connectionCode);
        return res.status(result.code).json(result);
    };
    findConnectedNonPatient = async (req, res) => {
        console.log(req.body);
        const result = await FindConnectedNonpatientService(req.body.userId);
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
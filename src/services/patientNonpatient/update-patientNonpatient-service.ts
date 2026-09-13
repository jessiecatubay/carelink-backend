import { prisma } from "@/lib/prisma";
import { PatientNonpatientRepository } from "@/repositories/patient-nonpatient-repository";
import { PatientNonPatient } from "@/types/user";

export async function UpdatePatientNonpatientService(
  patientId: string,
  nonPatientId: string,
  data: Partial<PatientNonPatient>,
) {
  const patientNonpatientRepository = new PatientNonpatientRepository();

  if (!patientId || !nonPatientId || !data) {
    return {
      code: 500,
      status: "error",
      message: "Missing data",
    };
  }

  try {
    if (data.currentPatient === true) {
      await prisma.$transaction([
        prisma.patientNonPatient.updateMany({
          where: { nonPatientId, status: "CONNECTED" },
          data: { currentPatient: false },
        }),
        prisma.patientNonPatient.update({
          where: { patientId_nonPatientId: { patientId, nonPatientId } },
          data: { currentPatient: true },
        }),
      ]);
    } else {
      await patientNonpatientRepository.update(patientId, nonPatientId, data);
    }

    return {
      code: 200,
      status: "success",
      message: "Successfully updated patient-nonpatient data",
    };
  } catch (error) {
    return {
      code: 500,
      status: "error",
      message: "Unable to update patient-nonpatient data",
    };
  }
}

export interface EmergencyContactData {
  id?: string;
  name?: string;
  relationship?: string;
  phoneNumber?: string;
  isPriority?: boolean;
  patientProfileId: string;
  createdAt?: Date;
  updatedAt?: Date;
}
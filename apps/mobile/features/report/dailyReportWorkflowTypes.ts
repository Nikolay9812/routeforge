export type DailyWorkflowStep = 1 | 2 | 3 | 4;

export type DailyReportFormState = {
  courierNote: string;
  endKm: string;
  missingProofExplanation: string;
  packagesDelivered: string;
  packagesPickedUp: string;
  packagesReturned: string;
  startKm: string;
  totalStops: string;
  tourNumber: string;
  vanPlate: string;
};

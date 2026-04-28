export interface SummaryCard {
  title: string;
  value: string;
}

export interface Appointment {
  id: string;
  doctor_name: string;
  start_time: string;
  time: string;
  status: "scheduled" | "completed" | "cancelled";
  avatar?: string;
}

export interface Tip {
  bold: string;
  light: string;
}

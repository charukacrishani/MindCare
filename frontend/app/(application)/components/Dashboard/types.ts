export interface SummaryCard {
  title: string;
  value: string;
}

export interface Appointment {
  id: string;
  doctor: string;
  date: string;
  time: string;
  status: "Pending" | "Completed" | "Canceled";
}

export interface Tip {
  bold: string;
  light: string;
}

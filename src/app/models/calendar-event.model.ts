export interface CalendarEvent {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  start_time?: string;
  end_time?: string;
  localisation: string;
}
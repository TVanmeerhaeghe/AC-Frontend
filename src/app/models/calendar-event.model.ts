export interface CalendarEvent {
  id?: number;
  name: string;
  description?: string;
  localisation?: string;
  duration_time?: number;
  start_date: string;
  end_date: string;
  customer_id?: number;
}
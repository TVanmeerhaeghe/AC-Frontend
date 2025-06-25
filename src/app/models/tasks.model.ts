export interface Task {
    id?: number;
    name: string;
    description?: string;
    hours: number;
    tva: string;
    hourly_rate: number;
    invoice_id?: number | null;
    estimate_id?: number | null;
    createdAt?: string;
    updatedAt?: string;
}
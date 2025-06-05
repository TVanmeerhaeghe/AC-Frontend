export interface Invoice {
    id?: number;
    creation_date: string;
    validity_date: string;
    object: string;
    status: InvoiceStatus;
    admin_note?: string | null;
    customer_id?: number | null;
    product_id?: number | null;
    discount_name?: string | null;
    discount_value: number;
    total_ht?: number;
    total_tva?: number;
    createdAt?: string;
    updatedAt?: string;
}

export enum InvoiceStatus {
    Brouillon = 'Brouillon',
    Envoye = 'Envoyé',
    Paye = 'Payé',
    Annule = 'Annulé'
}

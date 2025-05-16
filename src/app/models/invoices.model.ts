export interface Invoice {
    id: number;
    creationDate: Date;
    validityDate: Date;
    object: string;
    status: InvoiceStatus;
    adminNote: string;
    customerId: number;
    productId?: number;
    discountName: string;
    discountValue: number;
    createdAt: Date;
    updatedAt: Date;
}

export enum InvoiceStatus {
    Brouillon = 'Brouillon',
    Envoye = 'Envoyé',
    Paye = 'Payé',
    Annule = 'Annulé'
}

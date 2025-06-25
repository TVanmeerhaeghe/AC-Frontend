export interface Estimate {
    id: number;
    creationDate: Date;
    validityDate: Date;
    object: string;
    status: EstimateStatus;
    adminNote: string;
    customerId: number; // doit être number, pas string
    discountName: string;
    discountValue: number;
    finalNote: string;
    createdAt: Date;
    updatedAt: Date;
}

export enum EstimateStatus {
    Brouillon = 'Brouillon',
    Approuver = 'Approuver',
    Refuser = 'Refuser',
    Envoye = 'Envoyé',
    Accepte = 'Accepté'
}

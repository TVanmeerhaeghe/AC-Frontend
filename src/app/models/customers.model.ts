export interface Customer {
    id: number;
    name: string;
    surname: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

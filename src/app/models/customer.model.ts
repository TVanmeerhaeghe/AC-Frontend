export interface Customer {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    phone: string;
    address: string;
    postalCode: string;
    city: string;
    isArchived: boolean;
    createdAt: Date;
    updatedAt: Date;
}

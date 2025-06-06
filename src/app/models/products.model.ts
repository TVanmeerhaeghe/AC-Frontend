import { Customer } from './customers.model';

export interface Product {
    id: number;
    name: string;
    description: string;
    category_id: number;
    condition: Condition;
    price: number;
    sell_state: boolean;
    imageUrl: string;
    imageUrls: string[];
    image: string;
    video: string;
    quantity: number;
    material: string;
    style: string;
    buy_by?: Customer;
}

export enum Condition {
    Neuf = 'Nef',
    PresqueNeuf = 'Presque Neuf',
    Bon = 'Bon',
    Passable = 'Passable'
}
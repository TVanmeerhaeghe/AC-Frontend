export interface Product {
    id: number;
    name: string;
    description: string;
    category_id: number;
    condition: Condition;
    price: number;
    sellState: boolean;
    imageUrl: string;
    imageUrls: string[];
    image: string;
    video: string;
    quantity: number;
    material:string;
    style:string;
}

export enum Condition {
    Neuf = 'NEUF',
    PresqueNeuf = 'PRESQUE_NEUF',
    Bon = 'BON',
    Passable = 'PASSABLE'
}
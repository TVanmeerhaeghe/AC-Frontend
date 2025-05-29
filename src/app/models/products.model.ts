export interface Product {
    id: number;
    name: string;
    description: string;
    categoryId: number;
    condition: Condition;
    price: number;
    sellState: boolean;
    imageUrl: string;
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
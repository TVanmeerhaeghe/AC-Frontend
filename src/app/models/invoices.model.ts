export interface Invoice {
    id?: number;
    creation_date: string;
    validity_date: string;
    object: string;
    status: InvoiceStatus;
    admin_note?: string | null;
    customer_id?: number | null;
    discount_name?: string | null;
    discount_value: number;
    total_ht?: number;
    total_tva?: number;
    createdAt?: string;
    updatedAt?: string;
    products?: InvoiceProduct[];
}

export enum InvoiceStatus {
    Brouillon = 'Brouillon',
    Envoye = 'Envoyé',
    Paye = 'Payé',
    Annule = 'Annulé'
}

export interface InvoiceProduct {
  id: number;
  name: string;
  description?: string;
  category_id?: number;
  condition?: string;
  price: number;
  sell_state?: boolean;
  images?: string;
  video?: string | null;
  buy_by?: number | null;
  quantity: number;
  material?: string | null;
  style?: string | null;
  createdAt?: string;
  updatedAt?: string;
  InvoiceProduct?: { quantity: number };
  imageUrl?: string;
  imageUrls?: string[];
  videoUrl?: string | null;
}
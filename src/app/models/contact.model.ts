import { Product } from './products.model';

export interface Contact {
  id: number;
  name: string;
  surname: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  product_id?: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
}

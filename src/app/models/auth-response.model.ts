import { User } from './users.model';

export interface AuthResponse {
  token: string;
  user: User;
}

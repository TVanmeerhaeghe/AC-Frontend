import { User } from './user.model';

export interface AuthResponse {
  token: string;
  user: User;
}

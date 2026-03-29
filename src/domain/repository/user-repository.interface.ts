import { User } from '../entity/user/user.entity.js';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findRoleIdByName(name: string): Promise<string | null>;
  save(user: User): Promise<void>;
}

import User from "../entity/user/user";
import RepositoryInterface, { PaginationOptions } from "./repository-interface";

export default interface UserRepositoryInterface
  extends RepositoryInterface<User> {
  findByEmail(email: string): Promise<User | null>;
  // Overload
  findAll(): Promise<User[]>;
  findAll(paginationOptions: PaginationOptions): Promise<User[]>;
}

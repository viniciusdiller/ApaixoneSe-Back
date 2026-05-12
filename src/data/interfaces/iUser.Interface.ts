import { User } from "../entities/user.Entity";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsuario(usuario: string): Promise<User | null>;
  save(user: User): Promise<User>;
}

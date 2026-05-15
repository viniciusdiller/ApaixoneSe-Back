import { User } from "../entities/user.Entity";

export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByUsuario(usuario: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  update(id: string, data: any): Promise<User>;
  delete(id: string): Promise<void>;
  save(user: User): Promise<User>;
}

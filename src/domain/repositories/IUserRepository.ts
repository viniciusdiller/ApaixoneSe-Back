import { User } from "../entities/User.entity";

export interface IUserRepository {
  // Busca exata e rápida pela chave primária
  findById(id: string): Promise<User | null>;

  // Usado no Login e na checagem de cadastro
  findByEmail(email: string): Promise<User | null>;

  // Usado para garantir que não existam dois @ iguais
  findByUsuario(usuario: string): Promise<User | null>;

  // Salva no banco de dados
  save(user: User): Promise<User>;
}

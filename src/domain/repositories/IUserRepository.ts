import { User } from "../entities/User.entity";

// Interface = Contrato. "Quem quiser conversar com o banco de dados sobre Usuários, TEM que ter essas funções".
export interface IUserRepository {
  // "Prometo" (Promise) buscar um usuário no banco pelo ID e devolver o User pronto, ou null se não achar.
  findById(id: string): Promise<User | null>;

  findByEmail(email: string): Promise<User | null>;

  findByUsuario(usuario: string): Promise<User | null>;

  // "Prometo" (Promise) receber uma entidade User, salvar no MySQL e devolver a entidade atualizada (com o ID novo).
  save(user: User): Promise<User>;
}

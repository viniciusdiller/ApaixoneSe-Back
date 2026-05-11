import { User } from "../../domain/entities/User.entity";
import { UserOutputDTO } from "../dtos/UserDTO";

export class UserMapper {
  // Uma função estática (não precisa dar 'new UserMapper()')
  // que recebe a Entity bruta e devolve a DTO limpinha.
  static toOutputDTO(user: User): UserOutputDTO {
    return {
      // Usamos 'as string' no id e createdAt porque, neste ponto da arquitetura,
      // nós já temos certeza absoluta que eles existem (já vieram do banco).
      id: user.id as string,
      nome: user.nome,
      usuario: user.usuario,
      email: user.email,
      perfil: user.perfil,
      createdAt: user.createdAt as Date,
    };
  }
}

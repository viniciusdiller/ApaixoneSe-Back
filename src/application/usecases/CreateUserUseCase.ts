import bcrypt from "bcryptjs";
import { User } from "../../domain/entities/User.entity";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ICreateUserUseCase } from "../interfaces/ICreateUserUseCase";
import { CreateUserDTO, UserOutputDTO } from "../dtos/UserDTO";
import { UserMapper } from "../mappers/UserMapper";

// Repare no "implements ICreateUserUseCase" (Passo 4)!
export class CreateUserUseCase implements ICreateUserUseCase {
  // Recebe o contrato do banco de dados
  constructor(private userRepository: IUserRepository) {}

  // A função execute exigida pela Interface (Passo 4), que recebe e devolve os DTOs (Passo 5)
  async execute(data: CreateUserDTO): Promise<UserOutputDTO> {
    // Orquestração: Verificar duplicidades
    const emailExists = await this.userRepository.findByEmail(data.email);
    if (emailExists) {
      throw new Error("Este email já está cadastrado.");
    }

    if (data.perfil === "ADMIN") {
      throw new Error(
        "Não é permitido criar uma conta de administrador por este canal.",
      );
    }

    const usuarioExists = await this.userRepository.findByUsuario(data.usuario);
    if (usuarioExists) {
      throw new Error("Este nome de usuário (@) já está em uso.");
    }

    // Orquestração: Criptografar
    const senhaCriptografada = await bcrypt.hash(data.senha, 10);

    // Orquestração: Criar a Entidade (que faz a validação dos dados em branco)
    const newUser = new User({
      nome: data.nome,
      usuario: data.usuario,
      email: data.email,
      perfil: data.perfil,
      senha: senhaCriptografada,
    });

    // Orquestração: Salvar no banco (isso retorna uma Entity com a senha e o ID gerado)
    const userSalvoNoBanco = await this.userRepository.save(newUser);

    // Orquestração: Usar o Mapper (Passo 6) para limpar a senha antes de devolver pro Controller!
    return UserMapper.toOutputDTO(userSalvoNoBanco);
  }
}

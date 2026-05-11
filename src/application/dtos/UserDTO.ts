import { PerfilUsuario } from "../../domain/entities/User.entity";
// O que vem da requisição do front-end (Input)
export interface CreateUserDTO {
  nome: string;
  usuario: string;
  email: string;
  senha: string;
  perfil: PerfilUsuario;
}

// O que nós devolvemos para o front-end (Output)
// Repare que NÃO DEVOLVEMOS A SENHA! Essa é a grande utilidade do DTO de saída.
export interface UserOutputDTO {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  perfil: PerfilUsuario;
  createdAt: Date;
}

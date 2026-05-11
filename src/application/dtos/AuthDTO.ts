import { UserOutputDTO } from "./UserDTO";

// O que o usuário digita na tela de login
export interface LoginUserDTO {
  identificador: string;
  senha: string;
}

export interface LoginOutputDTO {
  token: string;
  user: UserOutputDTO;
}

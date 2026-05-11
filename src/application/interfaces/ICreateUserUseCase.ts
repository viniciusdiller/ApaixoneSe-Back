import { CreateUserDTO, UserOutputDTO } from "../dtos/UserDTO";

// Este é o contrato do nosso Caso de Uso.
// Ele diz: "Quem for criar um usuário, tem que ter uma função 'execute'
// que recebe um DTO de entrada e devolve um DTO de saída".
export interface ICreateUserUseCase {
  execute(data: CreateUserDTO): Promise<UserOutputDTO>;
}

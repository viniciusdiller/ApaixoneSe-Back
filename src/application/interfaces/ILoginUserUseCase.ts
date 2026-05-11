import { LoginUserDTO, LoginOutputDTO } from "../dtos/AuthDTO";

export interface ILoginUserUseCase {
  execute(data: LoginUserDTO): Promise<LoginOutputDTO>;
}

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { ILoginUserUseCase } from "../interfaces/ILoginUserUseCase";
import { LoginUserDTO, LoginOutputDTO } from "../dtos/AuthDTO";
import { UserMapper } from "../mappers/UserMapper";

export class LoginUserUseCase implements ILoginUserUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(data: LoginUserDTO): Promise<LoginOutputDTO> {
    let user = null;

    if (data.identificador.includes("@")) {
      // Se tem arroba, procuramos pela coluna de email
      user = await this.userRepository.findByEmail(data.identificador);
    } else {
      // Se não tem arroba, procuramos pela coluna de usuario
      user = await this.userRepository.findByUsuario(data.identificador);
    }

    // 🛡️ Segurança: Mensagem genérica para não dar pistas a hackers
    if (!user) {
      throw new Error("Credenciais incorretas.");
    }

    // 2. Comparar a senha
    const senhaCorreta = await bcrypt.compare(data.senha, user.senha);
    if (!senhaCorreta) {
      throw new Error("Credenciais incorretas.");
    }

    // 3. Fabricar o Token JWT com o Perfil dentro
    const tokenPayload = {
      id: user.id,
      perfil: user.perfil,
    };

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("Chave JWT não configurada no servidor.");
    }

    const token = jwt.sign(tokenPayload, secret, { expiresIn: "1d" });

    // 4. Devolver a resposta
    return {
      token: token,
      user: UserMapper.toOutputDTO(user),
    };
  }
}

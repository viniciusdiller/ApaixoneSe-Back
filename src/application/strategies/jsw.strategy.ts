import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Ensina o NestJS a procurar o Token no Header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Rejeita tokens expirados
      // A SUA CHAVE MESTRA (Deve ser a mesma que você usa quando GERA o token no Login)
      secretOrKey:
        process.env.JWT_SECRET || "sua_chave_secreta_super_segura_aqui",
    });
  }

  // Se a assinatura for válida, o NestJS chama esta função passando os dados que estavam lá dentro (payload)
  async validate(payload: any): Promise<IUsuarioLogado> {
    const usuarioId = payload.sub || payload.id;

    // 2. Se não encontrarmos o ID, aí sim rejeitamos
    if (!payload || !usuarioId) {
      throw new UnauthorizedException(
        "Token inválido. O ID do utilizador não foi encontrado dentro do Token.",
      );
    }

    // 3. Retornamos o utilizador para o NestJS injetar no req.user
    return {
      id: String(usuarioId),
      perfil: payload.perfil || "USUARIO", // Se não vier perfil, assume USUARIO por segurança
    };
  }
}

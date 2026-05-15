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
    if (!payload || !payload.sub) {
      throw new UnauthorizedException("Token inválido.");
    }

    // O retorno desta função é o que o NestJS vai injetar automaticamente no "req.user"!
    return {
      id: payload.sub, // O padrão JWT usa 'sub' (subject) para guardar o ID
      perfil: payload.perfil,
    };
  }
}

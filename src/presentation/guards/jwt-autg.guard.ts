import { Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {
  // Personalizamos o erro para ficar em português caso alguém tente entrar sem token
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          "Acesso negado. É necessário estar autenticado.",
        )
      );
    }
    return user;
  }
}

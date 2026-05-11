import { Request, Response } from "express";
import { ILoginUserUseCase } from "../../../application/interfaces/ILoginUserUseCase";

export class AuthController {
  constructor(private loginUserUseCase: ILoginUserUseCase) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { identificador, senha } = req.body;

      if (!identificador || !senha) {
        res.status(400).json({
          error: "Email ou usuário, e a senha são obrigatórios.",
        });
        return;
      }

      const authOutput = await this.loginUserUseCase.execute({
        identificador,
        senha,
      });

      // 200 OK significa que a requisição deu certo (não criamos nada novo, apenas consultamos)
      res.status(200).json({
        message: "Login realizado com sucesso!",
        token: authOutput.token,
        user: authOutput.user,
      });
    } catch (error: any) {
      if (error instanceof Error) {
        // 401 é o código padrão para "Você não tem permissão para entrar (senha ou email errados)"
        res.status(401).json({ error: error.message });
      } else {
        console.error("Erro Crítico no Servidor:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
      }
    }
  };
}

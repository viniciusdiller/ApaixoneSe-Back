import { Request, Response } from "express";
import { ICreateUserUseCase } from "../../../application/interfaces/ICreateUserUseCase";

export class UserController {
  // Injeção de Dependência: O Controller precisa do Maestro (UseCase) para trabalhar.
  constructor(private createUserUseCase: ICreateUserUseCase) {}

  // Usamos uma arrow function para garantir que o "this" não se perca no Express
  criarUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      // 1. Pegamos os dados que o usuário digitou no frontend
      const { nome, usuario, email, senha } = req.body;

      // 2. Segurança Básica: Garantir que não mandaram um JSON vazio
      if (!nome || !usuario || !email || !senha) {
        res
          .status(400)
          .json({
            error:
              "Todos os campos (nome, usuario, email e senha) são obrigatórios.",
          });
        return; // O return vazio para a execução aqui
      }

      // 3. Mandamos os dados para o Maestro (UseCase) fazer toda a validação e salvar
      const userOutput = await this.createUserUseCase.execute({
        nome,
        usuario,
        email,
        senha,
      });

      // 4. Se deu tudo certo, devolvemos o Status 201 (Created) e o usuário limpo (sem senha)
      res.status(201).json({
        message: "Usuário criado com sucesso!",
        user: userOutput,
      });
    } catch (error: any) {
      // Segurança: Tratamento de erros
      // Se o erro foi gerado pelas nossas validações (ex: "Email já cadastrado" ou "Senha muito curta")
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        // Se for um erro bizarro (ex: banco caiu), não mostramos detalhes ao usuário
        console.error("Erro Crítico no Servidor:", error);
        res
          .status(500)
          .json({
            error: "Erro interno do servidor. Tente novamente mais tarde.",
          });
      }
    }
  };
}

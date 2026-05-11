import { Router } from "express";
import { PrismaUserRepository } from "../../repositories/PrismaUserRepository";
import { LoginUserUseCase } from "../../../application/usecases/LoginUserUSeCase";
import { AuthController } from "../controllers/AuthController";

const router = Router();

// ==========================================
// INJEÇÃO DE DEPENDÊNCIAS
// ==========================================
const userRepository = new PrismaUserRepository();
const loginUserUseCase = new LoginUserUseCase(userRepository);
const authController = new AuthController(loginUserUseCase);

// ==========================================
// ROTAS
// ==========================================
router.post("/login", authController.login);

export default router;

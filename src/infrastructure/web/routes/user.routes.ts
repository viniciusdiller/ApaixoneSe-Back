import { Router } from "express";
import { PrismaUserRepository } from "../../repositories/PrismaUserRepository";
import { CreateUserUseCase } from "../../../application/usecases/CreateUserUseCase";
import { UserController } from "../controllers/UserController";

const router = Router();

// ==========================================
// INJEÇÃO DE DEPENDÊNCIAS
// ==========================================
const userRepository = new PrismaUserRepository();
const createUserUseCase = new CreateUserUseCase(userRepository);
const userController = new UserController(createUserUseCase);

// ==========================================
// ROTAS
// ==========================================
router.post("/register", userController.criarUsuario);

export default router;

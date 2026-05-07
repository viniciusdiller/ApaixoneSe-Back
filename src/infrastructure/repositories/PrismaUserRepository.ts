import { PrismaClient } from "@prisma/client";
import { User } from "../../domain/entities/User.entity";
import { IUserRepository } from "../../domain/repositories/IUserRepository";

// Instanciamos o Prisma para ele conectar no MySQL
const prisma = new PrismaClient();

// O "implements IUserRepository" obriga esta classe a ter as 4 funções que definimos antes!
export class PrismaUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    // Olha o await aqui! O código PARA e ESPERA o Prisma ir no banco de dados.
    const userPrisma = await prisma.user.findUnique({
      where: { id: id },
    });

    if (!userPrisma) return null;

    // Quando o Prisma devolve o dado, nós transformamos ele na nossa "Entity" pura
    return new User(userPrisma, userPrisma.id, userPrisma.createdAt);
  }

  async findByEmail(email: string): Promise<User | null> {
    // Outro await! Esperando o banco procurar por email...
    const userPrisma = await prisma.user.findUnique({
      where: { email: email },
    });

    if (!userPrisma) return null;
    return new User(userPrisma, userPrisma.id, userPrisma.createdAt);
  }

  async findByUsuario(usuario: string): Promise<User | null> {
    const userPrisma = await prisma.user.findUnique({
      where: { usuario: usuario },
    });

    if (!userPrisma) return null;
    return new User(userPrisma, userPrisma.id, userPrisma.createdAt);
  }

  async save(user: User): Promise<User> {
    // Await esperando o banco fazer o INSERT (salvar)
    const novoUserPrisma = await prisma.user.create({
      data: {
        nome: user.nome,
        usuario: user.usuario,
        email: user.email,
        senha: user.senha,

        // Não passamos o ID nem o createdAt porque o Prisma gera automático!
      },
    });

    // Devolvemos a Entity prontinha, agora COM id e data de criação gerados pelo banco!
    return new User(
      novoUserPrisma,
      novoUserPrisma.id,
      novoUserPrisma.createdAt,
    );
  }
}

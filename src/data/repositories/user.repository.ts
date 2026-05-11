import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IUserRepository } from "../interfaces/iUser.Interface";
import { User, PerfilUsuario } from "../entities/user.Entity";

@Injectable()
export class UserRepository implements IUserRepository {
  // Injeção de Dependência Mágica do NestJS
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    const userPrisma = await this.prisma.user.findUnique({ where: { id } });
    if (!userPrisma) return null;
    return new User(
      { ...userPrisma, perfil: userPrisma.perfil as PerfilUsuario },
      userPrisma.id,
      userPrisma.createdAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const userPrisma = await this.prisma.user.findUnique({ where: { email } });
    if (!userPrisma) return null;
    return new User(
      { ...userPrisma, perfil: userPrisma.perfil as PerfilUsuario },
      userPrisma.id,
      userPrisma.createdAt,
    );
  }

  async findByUsuario(usuario: string): Promise<User | null> {
    const userPrisma = await this.prisma.user.findUnique({
      where: { usuario },
    });
    if (!userPrisma) return null;
    return new User(
      { ...userPrisma, perfil: userPrisma.perfil as PerfilUsuario },
      userPrisma.id,
      userPrisma.createdAt,
    );
  }

  async save(user: User): Promise<User> {
    const novoUserPrisma = await this.prisma.user.create({
      data: {
        nome: user.nome,
        usuario: user.usuario,
        email: user.email,
        senha: user.senha,
        perfil: user.perfil,
      },
    });
    return new User(
      { ...novoUserPrisma, perfil: novoUserPrisma.perfil as PerfilUsuario },
      novoUserPrisma.id,
      novoUserPrisma.createdAt,
    );
  }
}

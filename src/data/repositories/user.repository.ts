import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IUserRepository } from "../interfaces/iUser.Interface";
import { User, PerfilUsuario } from "../entities/user.Entity";

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<User[]> {
    const usersPrisma = await this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });

    return usersPrisma.map(
      (u) =>
        new User(
          { ...u, perfil: u.perfil as PerfilUsuario },
          u.id,
          u.createdAt,
        ),
    );
  }

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

  async update(id: string, data: Partial<User>): Promise<User> {
    const userAtualizado = await this.prisma.user.update({
      where: { id },
      data: {
        nome: data.nome,
        usuario: data.usuario,
        email: data.email,
        senha: data.senha,
        perfil: data.perfil,
      },
    });

    return new User(
      { ...userAtualizado, perfil: userAtualizado.perfil as PerfilUsuario },
      userAtualizado.id,
      userAtualizado.createdAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { ICatRepository } from "../interfaces/iCat.Interface";
import { Cat } from "../entities/cat.Entity";

@Injectable()
export class CatRepository implements ICatRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(cat: Cat): Promise<Cat> {
    const criado = await this.prisma.cat.create({
      data: {
        texto: cat.texto,
        arquivoUrl: cat.arquivoUrl,
      },
    });
    return new Cat(criado);
  }

  async findAll(): Promise<Cat[]> {
    const lista = await this.prisma.cat.findMany({
      orderBy: { createdAt: "desc" },
    });
    return lista.map((c) => new Cat(c));
  }

  async findById(id: string): Promise<Cat | null> {
    const c = await this.prisma.cat.findUnique({ where: { id } });
    if (!c) return null;
    return new Cat(c);
  }

  async update(id: string, data: Partial<Cat>): Promise<Cat> {
    const atualizado = await this.prisma.cat.update({
      where: { id },
      data,
    });
    return new Cat(atualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.cat.delete({ where: { id } });
  }
}

import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { ICatMovelRepository } from "../interfaces/iCatMovel.Interface";
import { CatMovel } from "../entities/catMovel.Entity";

@Injectable()
export class CatMovelRepository implements ICatMovelRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(catMovel: CatMovel): Promise<CatMovel> {
    const criado = await this.prisma.catMovel.create({
      data: {
        titulo: catMovel.titulo,
        descricao: catMovel.descricao,
        imagemUrl: catMovel.imagemUrl ?? null,
        videoUrl: catMovel.videoUrl ?? null,
      },
    });
    return new CatMovel(criado);
  }

  async findAll(): Promise<CatMovel[]> {
    const lista = await this.prisma.catMovel.findMany({
      orderBy: { createdAt: "desc" },
    });
    return lista.map((c) => new CatMovel(c));
  }

  async findById(id: string): Promise<CatMovel | null> {
    const c = await this.prisma.catMovel.findUnique({ where: { id } });
    if (!c) return null;
    return new CatMovel(c);
  }

  async update(id: string, data: Partial<CatMovel>): Promise<CatMovel> {
    const atualizado = await this.prisma.catMovel.update({
      where: { id },
      data,
    });
    return new CatMovel(atualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.catMovel.delete({ where: { id } });
  }
}

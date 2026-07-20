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
        imagensUrl: catMovel.imagensUrl ?? undefined,
      },
    });
    return new CatMovel(criado);
  }

  // Busca o primeiro (e único) registro da tabela
  async findFirst(): Promise<CatMovel | null> {
    const c = await this.prisma.catMovel.findFirst();
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
}

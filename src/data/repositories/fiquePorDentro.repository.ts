import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IFiquePorDentroRepository } from "../interfaces/iFiquePorDentro.Interface";
import { FiquePorDentro } from "../entities/fiquePorDentro.Entity";

@Injectable()
export class FiquePorDentroRepository implements IFiquePorDentroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(item: FiquePorDentro): Promise<FiquePorDentro> {
    const criado = await this.prisma.fiquePorDentro.create({
      data: {
        ordem: item.ordem,
        imagemUrl: item.imagemUrl,
      },
    });
    return new FiquePorDentro(criado);
  }

  async findAll(): Promise<FiquePorDentro[]> {
    const itens = await this.prisma.fiquePorDentro.findMany({
      orderBy: { ordem: "asc" },
    });
    return itens.map((i) => new FiquePorDentro(i));
  }

  async findByOrdem(ordem: string): Promise<FiquePorDentro | null> {
    const item = await this.prisma.fiquePorDentro.findFirst({
      where: { ordem },
    });
    return item ? new FiquePorDentro(item) : null;
  }

  async findById(id: string): Promise<FiquePorDentro | null> {
    const item = await this.prisma.fiquePorDentro.findUnique({ where: { id } });
    return item ? new FiquePorDentro(item) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fiquePorDentro.delete({ where: { id } });
  }
}

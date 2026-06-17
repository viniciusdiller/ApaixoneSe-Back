import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IFiquePorDentroRepository } from "../interfaces/iFiquePorDentro.Interface";
import { FiquePorDentro } from "../entities/fiquePorDentro.Entity";

@Injectable()
export class FiquePorDentroRepository implements IFiquePorDentroRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(item: FiquePorDentro): Promise<FiquePorDentro> {
    const criado = await this.prisma.fiquePorDentro.create({
      data: { ordem: item.ordem, imagemUrl: item.imagemUrl },
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
    const item = await this.prisma.fiquePorDentro.findFirst({ where: { ordem } });
    return item ? new FiquePorDentro(item) : null;
  }

  async findById(id: string): Promise<FiquePorDentro | null> {
    const item = await this.prisma.fiquePorDentro.findUnique({ where: { id } });
    return item ? new FiquePorDentro(item) : null;
  }

  async update(
    id: string,
    data: { ordem?: string; imagemUrl?: string },
  ): Promise<FiquePorDentro> {
    const updated = await this.prisma.fiquePorDentro.update({
      where: { id },
      data,
    });
    return new FiquePorDentro(updated);
  }

  /**
   * Troca as ordens de dois itens em uma única transação Prisma.
   * Usa um valor UUID temporário para contornar o UNIQUE constraint
   * sem precisar de um número fora do range 1-5.
   */
  async swapOrdens(idA: string, ordemA: string, idB: string, ordemB: string): Promise<void> {
    const temp = `__swap_${Date.now()}__`;
    await this.prisma.$transaction([
      // Passo 1: move A para valor temporário (string livre, sem validação de range aqui)
      this.prisma.fiquePorDentro.update({ where: { id: idA }, data: { ordem: temp } }),
      // Passo 2: move B para a posição original de A
      this.prisma.fiquePorDentro.update({ where: { id: idB }, data: { ordem: ordemA } }),
      // Passo 3: move A para a posição de B
      this.prisma.fiquePorDentro.update({ where: { id: idA }, data: { ordem: ordemB } }),
    ]);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.fiquePorDentro.delete({ where: { id } });
  }
}

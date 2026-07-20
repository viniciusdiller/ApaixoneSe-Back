import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { ICasaDeCambioRepository } from "../interfaces/iCasaDeCambio.Interface";
import { CasaDeCambio } from "../entities/casaDeCambio.Entity";

@Injectable()
export class CasaDeCambioRepository implements ICasaDeCambioRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(casa: CasaDeCambio): Promise<CasaDeCambio> {
    const criado = await this.prisma.casaDeCambio.create({
      data: {
        nome: casa.nome,
        telefone: casa.telefone,
        endereco: casa.endereco,
        logoUrl: casa.logoUrl,
      },
    });
    return new CasaDeCambio(criado);
  }

  async findAll(): Promise<CasaDeCambio[]> {
    const lista = await this.prisma.casaDeCambio.findMany({
      orderBy: { createdAt: "desc" },
    });
    return lista.map((c) => new CasaDeCambio(c));
  }

  async findById(id: string): Promise<CasaDeCambio | null> {
    const c = await this.prisma.casaDeCambio.findUnique({ where: { id } });
    if (!c) return null;
    return new CasaDeCambio(c);
  }

  async update(id: string, data: Partial<CasaDeCambio>): Promise<CasaDeCambio> {
    const atualizado = await this.prisma.casaDeCambio.update({
      where: { id },
      data,
    });
    return new CasaDeCambio(atualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.casaDeCambio.delete({ where: { id } });
  }
}

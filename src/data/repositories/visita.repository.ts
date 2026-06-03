import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IVisitaRepository } from "../interfaces/iVisita.Interface";
import { Visita } from "../entities/visita.Entity";

@Injectable()
export class VisitaRepository implements IVisitaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(visita: Visita): Promise<Visita> {
    const salvo = await this.prisma.visita.create({
      data: {
        usuarioId: visita.usuarioId,
        gastronomiaId: visita.gastronomiaId,
        atividadeId: visita.atividadeId,
      },
    });
    return new Visita(salvo, salvo.id, salvo.dataVisita);
  }

  async findByUserAndGastronomia(
    usuarioId: string,
    gastronomiaId: string,
  ): Promise<Visita | null> {
    const v = await this.prisma.visita.findFirst({
      where: { usuarioId, gastronomiaId },
    });
    if (!v) return null;
    return new Visita(v, v.id, v.dataVisita);
  }

  async findByUserAndAtividade(
    usuarioId: string,
    atividadeId: string,
  ): Promise<Visita | null> {
    const v = await this.prisma.visita.findFirst({
      where: { usuarioId, atividadeId },
    });
    if (!v) return null;
    return new Visita(v, v.id, v.dataVisita);
  }

  async findByUser(usuarioId: string): Promise<Visita[]> {
    const lista = await this.prisma.visita.findMany({
      where: { usuarioId },
    });
    return lista.map((v) => new Visita(v, v.id, v.dataVisita));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.visita.delete({ where: { id } });
  }
}

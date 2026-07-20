import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IPontoAguaRepository } from "../interfaces/iPontoAgua.Interface";
import { PontoAgua } from "../entities/pontoAgua.Entity";
import { TipoPontoAgua } from "@prisma/client";

@Injectable()
export class PontoAguaRepository implements IPontoAguaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(pontoAgua: PontoAgua): Promise<PontoAgua> {
    const criado = await this.prisma.pontoAgua.create({
      data: {
        tipo: pontoAgua.tipo,
        nome: pontoAgua.nome,
        slug: pontoAgua.slug,
        descricaoCurta: pontoAgua.descricaoCurta,
        descricao: pontoAgua.descricao,
        imagemUrl: pontoAgua.imagemUrl,
        filtros: pontoAgua.filtros ?? undefined,
        acessivel: pontoAgua.acessivel,
        dificuldade: pontoAgua.dificuldade,
        estacionamento: pontoAgua.estacionamento,
        quiosques: pontoAgua.quiosques,
        endereco: pontoAgua.endereco,
        latitude: pontoAgua.latitude,
        longitude: pontoAgua.longitude,
      },
    });

    return new PontoAgua(
      criado,
      criado.id,
      criado.createdAt,
      criado.updatedAt,
    );
  }

  async findAll(): Promise<PontoAgua[]> {
    const lista = await this.prisma.pontoAgua.findMany({
      orderBy: { createdAt: "desc" },
    });
    return lista.map((p) => new PontoAgua(p, p.id, p.createdAt, p.updatedAt));
  }

  async findByTipo(tipo: TipoPontoAgua): Promise<PontoAgua[]> {
    const lista = await this.prisma.pontoAgua.findMany({
      where: { tipo },
      orderBy: { createdAt: "desc" },
    });
    return lista.map((p) => new PontoAgua(p, p.id, p.createdAt, p.updatedAt));
  }

  async findById(id: string): Promise<PontoAgua | null> {
    const item = await this.prisma.pontoAgua.findUnique({ where: { id } });
    if (!item) return null;
    return new PontoAgua(item, item.id, item.createdAt, item.updatedAt);
  }

  async findBySlug(slug: string): Promise<PontoAgua | null> {
    const item = await this.prisma.pontoAgua.findUnique({ where: { slug } });
    if (!item) return null;
    return new PontoAgua(item, item.id, item.createdAt, item.updatedAt);
  }

  async update(id: string, data: Partial<PontoAgua>): Promise<PontoAgua> {
    const atualizado = await this.prisma.pontoAgua.update({
      where: { id },
      data: {
        tipo: data.tipo,
        nome: data.nome,
        slug: data.slug,
        descricaoCurta: data.descricaoCurta,
        descricao: data.descricao,
        imagemUrl: data.imagemUrl,
        filtros: data.filtros ?? undefined,
        acessivel: data.acessivel,
        dificuldade: data.dificuldade,
        estacionamento: data.estacionamento,
        quiosques: data.quiosques,
        endereco: data.endereco,
        latitude: data.latitude,
        longitude: data.longitude,
      },
    });

    return new PontoAgua(
      atualizado,
      atualizado.id,
      atualizado.createdAt,
      atualizado.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.pontoAgua.delete({ where: { id } });
  }
}

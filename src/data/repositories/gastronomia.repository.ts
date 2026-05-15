import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IGastronomiaRepository } from "../interfaces/iGastronomia.Interface";
import { Gastronomia } from "../entities/gastronomia.Entity";

@Injectable()
export class GastronomiaRepository implements IGastronomiaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(gastronomia: Gastronomia): Promise<Gastronomia> {
    const salvo = await this.prisma.gastronomia.create({
      data: {
        nome: gastronomia.nome,
        telefone: gastronomia.telefone,
        instagram: gastronomia.instagram,
        endereco: gastronomia.endereco,
        especialidade: gastronomia.especialidade,
        cnpj: gastronomia.cnpj,
        responsavelNome: gastronomia.responsavelNome,
        responsavelCpf: gastronomia.responsavelCpf,
        documentoPdfUrl: gastronomia.documentoPdfUrl,
        logoUrl: gastronomia.logoUrl,
        usuarioId: gastronomia.usuarioId,
      },
    });
    return new Gastronomia(salvo, salvo.id, salvo.createdAt, salvo.updatedAt);
  }

  async findAll(): Promise<Gastronomia[]> {
    const lista = await this.prisma.gastronomia.findMany();
    return lista.map((g) => new Gastronomia(g, g.id, g.createdAt, g.updatedAt));
  }

  async findById(id: string): Promise<Gastronomia | null> {
    const g = await this.prisma.gastronomia.findUnique({ where: { id } });
    if (!g) return null;
    return new Gastronomia(g, g.id, g.createdAt, g.updatedAt);
  }

  async update(id: string, data: Partial<Gastronomia>): Promise<Gastronomia> {
    const atualizado = await this.prisma.gastronomia.update({
      where: { id },
      data: {
        nome: data.nome,
        telefone: data.telefone,
        instagram: data.instagram,
        endereco: data.endereco,
        especialidade: data.especialidade,
        cnpj: data.cnpj,
        responsavelNome: data.responsavelNome,
        responsavelCpf: data.responsavelCpf,
        documentoPdfUrl: data.documentoPdfUrl,
        logoUrl: data.logoUrl,
        status: data.status,
      },
    });
    return new Gastronomia(
      atualizado,
      atualizado.id,
      atualizado.createdAt,
      atualizado.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.gastronomia.delete({ where: { id } });
  }
}

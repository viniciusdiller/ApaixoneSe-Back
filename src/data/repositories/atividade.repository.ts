import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IAtividadeRepository } from "../interfaces/iAtividade.Interface";
import { Atividade } from "../entities/atividade.Entity";
import { TipoRoteiro } from "@prisma/client";

@Injectable()
export class AtividadeRepository implements IAtividadeRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Criar uma nova atividade no banco
  async save(atividade: Atividade): Promise<Atividade> {
    const novaAtividadePrisma = await this.prisma.atividade.create({
      data: {
        titulo: atividade.titulo,
        descricao: atividade.descricao,
        local: atividade.local,
        latitude: atividade.latitude,
        longitude: atividade.longitude,
        roteiro: atividade.roteiro,
      },
    });

    // Retornamos a entidade "pura" montada
    return new Atividade(
      novaAtividadePrisma,
      novaAtividadePrisma.id,
      novaAtividadePrisma.createdAt,
      novaAtividadePrisma.updatedAt,
    );
  }

  // 2. Buscar todas as atividades do sistema
  async findAll(): Promise<Atividade[]> {
    const atividadesPrisma = await this.prisma.atividade.findMany();

    // Como é um array, usamos o .map para converter cada item do Prisma numa Entity
    return atividadesPrisma.map(
      (a) => new Atividade(a, a.id, a.createdAt, a.updatedAt),
    );
  }

  // 3. O nosso filtro de Roteiros! (Ex: Buscar tudo que for ESPORTE_E_AVENTURA)
  async findByRoteiro(roteiro: TipoRoteiro): Promise<Atividade[]> {
    const atividadesPrisma = await this.prisma.atividade.findMany({
      where: { roteiro: roteiro },
    });

    return atividadesPrisma.map(
      (a) => new Atividade(a, a.id, a.createdAt, a.updatedAt),
    );
  }

  // 4. Buscar uma atividade específica pelo ID (para ver os detalhes)
  async findById(id: string): Promise<Atividade | null> {
    const atividadePrisma = await this.prisma.atividade.findUnique({
      where: { id },
    });
    if (!atividadePrisma) return null;

    return new Atividade(
      atividadePrisma,
      atividadePrisma.id,
      atividadePrisma.createdAt,
      atividadePrisma.updatedAt,
    );
  }

  async update(id: string, data: Partial<Atividade>): Promise<Atividade> {
    const atividadeAtualizada = await this.prisma.atividade.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        local: data.local,
        latitude: data.latitude,
        longitude: data.longitude,
        roteiro: data.roteiro,
      },
    });

    return new Atividade(
      atividadeAtualizada,
      atividadeAtualizada.id,
      atividadeAtualizada.createdAt,
      atividadeAtualizada.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.atividade.delete({
      where: { id },
    });
  }
}

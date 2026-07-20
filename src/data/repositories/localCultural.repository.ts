import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { ILocalCulturalRepository } from "../interfaces/iLocalCultural.Interface";
import { LocalCultural } from "../entities/localCultural.Entity";

@Injectable()
export class LocalCulturalRepository implements ILocalCulturalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(localCultural: LocalCultural): Promise<LocalCultural> {
    const criado = await this.prisma.localCultural.create({
      data: {
        nome: localCultural.nome,
        descricao: localCultural.descricao,
        texto: localCultural.texto,
        imagemUrl: localCultural.imagemUrl,
        endereco: localCultural.endereco,
      },
    });

    return new LocalCultural(
      criado,
      criado.id,
      criado.createdAt,
      criado.updatedAt,
    );
  }

  async findAll(): Promise<LocalCultural[]> {
    const lista = await this.prisma.localCultural.findMany({
      orderBy: { createdAt: "desc" },
    });
    return lista.map(
      (l) => new LocalCultural(l, l.id, l.createdAt, l.updatedAt),
    );
  }

  async findById(id: string): Promise<LocalCultural | null> {
    const item = await this.prisma.localCultural.findUnique({
      where: { id },
    });
    if (!item) return null;
    return new LocalCultural(item, item.id, item.createdAt, item.updatedAt);
  }

  async update(
    id: string,
    data: Partial<LocalCultural>,
  ): Promise<LocalCultural> {
    const atualizado = await this.prisma.localCultural.update({
      where: { id },
      data: {
        nome: data.nome,
        descricao: data.descricao,
        texto: data.texto,
        imagemUrl: data.imagemUrl,
        endereco: data.endereco,
      },
    });

    return new LocalCultural(
      atualizado,
      atualizado.id,
      atualizado.createdAt,
      atualizado.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.localCultural.delete({ where: { id } });
  }
}

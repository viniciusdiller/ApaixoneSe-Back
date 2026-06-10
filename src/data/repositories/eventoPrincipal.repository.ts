import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IEventoPrincipalRepository } from "../interfaces/iEventoPrincipal.Interface";
import { EventoPrincipal } from "../entities/eventoPrincipal.Entity";

@Injectable()
export class EventoPrincipalRepository implements IEventoPrincipalRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(evento: EventoPrincipal): Promise<EventoPrincipal> {
    const salvo = await this.prisma.eventoPrincipal.create({
      data: { titulo: evento.titulo, etapa: evento.etapa, data: evento.data },
    });
    return new EventoPrincipal(
      salvo,
      salvo.id,
      salvo.createdAt,
      salvo.updatedAt,
    );
  }

  async findAll(): Promise<EventoPrincipal[]> {
    const lista = await this.prisma.eventoPrincipal.findMany({
      orderBy: { data: "asc" },
    });
    return lista.map(
      (e) => new EventoPrincipal(e, e.id, e.createdAt, e.updatedAt),
    );
  }

  async findById(id: string): Promise<EventoPrincipal | null> {
    const e = await this.prisma.eventoPrincipal.findUnique({ where: { id } });
    if (!e) return null;
    return new EventoPrincipal(e, e.id, e.createdAt, e.updatedAt);
  }

  async update(
    id: string,
    data: Partial<EventoPrincipal>,
  ): Promise<EventoPrincipal> {
    const atualizado = await this.prisma.eventoPrincipal.update({
      where: { id },
      data: { titulo: data.titulo, etapa: data.etapa, data: data.data },
    });
    return new EventoPrincipal(
      atualizado,
      atualizado.id,
      atualizado.createdAt,
      atualizado.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.eventoPrincipal.delete({ where: { id } });
  }
}

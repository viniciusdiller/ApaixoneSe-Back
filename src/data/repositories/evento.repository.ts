import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IEventoRepository } from "../interfaces/iEvento.Interface";
import { Evento } from "../entities/evento.Entity";
import { Mes } from "@prisma/client";

@Injectable()
export class EventoRepository implements IEventoRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 1. Salvar um Evento
  async save(evento: Evento): Promise<Evento> {
    const eventoPrisma = await this.prisma.eventos.create({
      data: {
        titulo: evento.titulo,
        descricao: evento.descricao,
        data: evento.data,
        local: evento.local,
      },
    });

    return new Evento(
      eventoPrisma,
      eventoPrisma.id,
      eventoPrisma.createdAt,
      eventoPrisma.updatedAt,
    );
  }

  // 2. Buscar todos (já ordenados por data!)
  async findAll(): Promise<Evento[]> {
    const eventosPrisma = await this.prisma.eventos.findMany({
      orderBy: { data: "asc" },
    });

    return eventosPrisma.map(
      (e) => new Evento(e, e.id, e.createdAt, e.updatedAt),
    );
  }

  // 3. Buscar detalhes de um único evento
  async findById(id: string): Promise<Evento | null> {
    const eventoPrisma = await this.prisma.eventos.findUnique({
      where: { id },
    });
    if (!eventoPrisma) return null;
    return new Evento(
      eventoPrisma,
      eventoPrisma.id,
      eventoPrisma.createdAt,
      eventoPrisma.updatedAt,
    );
  }

  async update(id: string, data: Partial<Evento>): Promise<Evento> {
    const eventoAtualizado = await this.prisma.eventos.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        data: data.data,
        local: data.local,
      },
    });

    return new Evento(
      eventoAtualizado,
      eventoAtualizado.id,
      eventoAtualizado.createdAt,
      eventoAtualizado.updatedAt,
    );
  }

  async delete(id: string): Promise<void> {
    await this.prisma.eventos.delete({
      where: { id },
    });
  }
}

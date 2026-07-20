import { Injectable } from "@nestjs/common";
import { PrismaService } from "../providers/db/prisma.Service";
import { IEventoRepository } from "../interfaces/iEvento.Interface";
import { Evento } from "../entities/evento.Entity";

@Injectable()
export class EventoRepository implements IEventoRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(eventoPrisma: {
    id: string;
    titulo: string;
    descricao: string;
    data: Date;
    local: string;
    endereco: string | null;
    fotoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
  }): Evento {
    return new Evento(
      {
        titulo: eventoPrisma.titulo,
        descricao: eventoPrisma.descricao,
        data: eventoPrisma.data,
        local: eventoPrisma.local,
        endereco: eventoPrisma.endereco,
        fotoUrl: eventoPrisma.fotoUrl ?? undefined,
      },
      eventoPrisma.id,
      eventoPrisma.createdAt,
      eventoPrisma.updatedAt,
    );
  }

  // 1. Salvar um Evento
  async save(evento: Evento): Promise<Evento> {
    const eventoPrisma = await this.prisma.eventos.create({
      data: {
        titulo: evento.titulo,
        descricao: evento.descricao,
        data: evento.data,
        local: evento.local,
        endereco: evento.endereco,
        fotoUrl: evento.fotoUrl,
      },
    });

    return this.toEntity(eventoPrisma);
  }

  // 2. Buscar todos (já ordenados por data!)
  async findAll(): Promise<Evento[]> {
    const eventosPrisma = await this.prisma.eventos.findMany({
      orderBy: { data: "asc" },
    });

    return eventosPrisma.map((e) => this.toEntity(e));
  }

  // 3. Buscar detalhes de um único evento
  async findById(id: string): Promise<Evento | null> {
    const eventoPrisma = await this.prisma.eventos.findUnique({
      where: { id },
    });
    if (!eventoPrisma) return null;
    return this.toEntity(eventoPrisma);
  }

  async update(id: string, data: Partial<Evento>): Promise<Evento> {
    const eventoAtualizado = await this.prisma.eventos.update({
      where: { id },
      data: {
        titulo: data.titulo,
        descricao: data.descricao,
        data: data.data,
        local: data.local,
        endereco: data.endereco,
        fotoUrl: data.fotoUrl,
      },
    });

    return this.toEntity(eventoAtualizado);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.eventos.delete({
      where: { id },
    });
  }
}

import { Evento } from "../entities/evento.Entity";
import { Mes } from "@prisma/client";

export interface IEventoRepository {
  // Gestão de Eventos
  save(evento: Evento): Promise<Evento>;

  findAll(): Promise<Evento[]>;

  findById(id: string): Promise<Evento | null>;

  update(id: string, data: Partial<Evento>): Promise<Evento>;

  delete(id: string): Promise<void>;
}

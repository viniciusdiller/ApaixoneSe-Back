import { Evento } from "../entities/evento.Entity";
import { Mes } from "@prisma/client";

export interface IEventoRepository {
  // Gestão de Eventos
  save(evento: Evento): Promise<Evento>;
  findAll(): Promise<Evento[]>;
  findById(id: string): Promise<Evento | null>;
  delete(id: string): Promise<void>;
  // Gestão da Imagem do Mês
  upsertImagemMes(mes: Mes, url: string): Promise<void>;
  getImagemMes(mes: Mes): Promise<string | null>;
}

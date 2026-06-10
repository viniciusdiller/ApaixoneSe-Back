import { Visita } from "../entities/visita.Entity";

export interface IVisitaRepository {
  save(visita: Visita): Promise<Visita>;
  findByUserAndGastronomia(
    usuarioId: string,
    gastronomiaId: string,
  ): Promise<Visita | null>;
  findByUserAndAtividade(
    usuarioId: string,
    atividadeId: string,
  ): Promise<Visita | null>;
  findByUser(usuarioId: string): Promise<Visita[]>;
  delete(id: string): Promise<void>;
}

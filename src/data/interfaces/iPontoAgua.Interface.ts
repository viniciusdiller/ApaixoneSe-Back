import { PontoAgua } from "../entities/pontoAgua.Entity";
import { TipoPontoAgua } from "@prisma/client";

export interface IPontoAguaRepository {
  save(pontoAgua: PontoAgua): Promise<PontoAgua>;
  findAll(): Promise<PontoAgua[]>;
  findByTipo(tipo: TipoPontoAgua): Promise<PontoAgua[]>;
  findById(id: string): Promise<PontoAgua | null>;
  findBySlug(slug: string): Promise<PontoAgua | null>;
  update(id: string, data: Partial<PontoAgua>): Promise<PontoAgua>;
  delete(id: string): Promise<void>;
}

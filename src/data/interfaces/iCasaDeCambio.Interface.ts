import { CasaDeCambio } from "../entities/casaDeCambio.Entity";

export interface ICasaDeCambioRepository {
  save(casaDeCambio: CasaDeCambio): Promise<CasaDeCambio>;
  findAll(): Promise<CasaDeCambio[]>;
  findById(id: string): Promise<CasaDeCambio | null>;
  update(id: string, data: Partial<CasaDeCambio>): Promise<CasaDeCambio>;
  delete(id: string): Promise<void>;
}

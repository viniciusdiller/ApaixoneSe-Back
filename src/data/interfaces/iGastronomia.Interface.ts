import { Gastronomia } from "../entities/gastronomia.Entity";

export interface IGastronomiaRepository {
  save(gastronomia: Gastronomia): Promise<Gastronomia>;
  findAll(): Promise<Gastronomia[]>;
  findById(id: string): Promise<Gastronomia | null>;
  update(id: string, gastronomia: Partial<Gastronomia>): Promise<Gastronomia>;
  delete(id: string): Promise<void>;
}

import { CatMovel } from "../entities/catMovel.Entity";

export interface ICatMovelRepository {
  save(catMovel: CatMovel): Promise<CatMovel>;
  findAll(): Promise<CatMovel[]>;
  findById(id: string): Promise<CatMovel | null>;
  update(id: string, data: Partial<CatMovel>): Promise<CatMovel>;
  delete(id: string): Promise<void>;
}

import { CatMovel } from "../entities/catMovel.Entity";

export interface ICatMovelRepository {
  save(catMovel: CatMovel): Promise<CatMovel>;
  findFirst(): Promise<CatMovel | null>;
  update(id: string, data: Partial<CatMovel>): Promise<CatMovel>;
}

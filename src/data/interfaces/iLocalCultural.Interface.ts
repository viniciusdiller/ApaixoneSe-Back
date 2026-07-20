import { LocalCultural } from "../entities/localCultural.Entity";

export interface ILocalCulturalRepository {
  save(localCultural: LocalCultural): Promise<LocalCultural>;
  findAll(): Promise<LocalCultural[]>;
  findById(id: string): Promise<LocalCultural | null>;
  update(id: string, data: Partial<LocalCultural>): Promise<LocalCultural>;
  delete(id: string): Promise<void>;
}

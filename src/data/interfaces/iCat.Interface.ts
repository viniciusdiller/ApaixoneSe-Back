import { Cat } from "../entities/cat.Entity";

export interface ICatRepository {
  save(cat: Cat): Promise<Cat>;
  findAll(): Promise<Cat[]>;
  findById(id: string): Promise<Cat | null>;
  update(id: string, data: Partial<Cat>): Promise<Cat>;
  delete(id: string): Promise<void>;
}

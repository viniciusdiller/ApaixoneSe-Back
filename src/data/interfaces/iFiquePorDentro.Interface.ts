import { FiquePorDentro } from "../entities/fiquePorDentro.Entity";

export interface IFiquePorDentroRepository {
  save(item: FiquePorDentro): Promise<FiquePorDentro>;
  update(id: string, data: { ordem: string; imagemUrl: string }): Promise<FiquePorDentro>;
  findAll(): Promise<FiquePorDentro[]>;
  findByOrdem(ordem: string): Promise<FiquePorDentro | null>;
  findById(id: string): Promise<FiquePorDentro | null>;
  delete(id: string): Promise<void>;
}

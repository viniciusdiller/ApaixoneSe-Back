import { Hospedagem } from "../entities/hospedagem.Entity";

export interface IHospedagemRepository {
  save(hospedagem: Hospedagem): Promise<Hospedagem>;
  findAll(): Promise<Hospedagem[]>;
  findById(id: string): Promise<Hospedagem | null>;
  update(id: string, data: Partial<Hospedagem>): Promise<Hospedagem>;
  delete(id: string): Promise<void>;
}

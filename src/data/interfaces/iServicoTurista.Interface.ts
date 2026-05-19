import { ServicoTurista } from "../entities/servicoTurista.Entity";

export interface IServicoTuristaRepository {
  save(servico: ServicoTurista): Promise<ServicoTurista>;
  findAll(): Promise<ServicoTurista[]>;
  findById(id: string): Promise<ServicoTurista | null>;
  update(id: string, data: Partial<ServicoTurista>): Promise<ServicoTurista>;
  delete(id: string): Promise<void>;
}

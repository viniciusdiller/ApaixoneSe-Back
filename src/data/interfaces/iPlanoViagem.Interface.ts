import { PlanoViagem } from "../entities/planoViagem.Entity";

export interface IPlanoViagemRepository {
  save(plano: PlanoViagem): Promise<PlanoViagem>;
  findByUsuarioId(usuarioId: string): Promise<PlanoViagem[]>;
  findById(id: string): Promise<PlanoViagem | null>;
  update(id: string, data: Partial<PlanoViagem>): Promise<PlanoViagem>;
  delete(id: string): Promise<void>;
}

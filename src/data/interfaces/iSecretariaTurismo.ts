import { SecretariaTurismo } from "../entities/secretariaTurismo.Entity";
import { SecretariaTurismoTuristando } from "../entities/secretariaTurismoTuristando.Entity";
import { SecretariaTurismoProjeto } from "../entities/secretariaTurismoProjeto.Entity";

export interface ISecretariaTurismoRepository {
  save(data: SecretariaTurismo): Promise<SecretariaTurismo>;
  findAll(): Promise<SecretariaTurismo[]>;
  findById(id: string): Promise<SecretariaTurismo | null>;
  update(id: string, data: Partial<SecretariaTurismo>): Promise<SecretariaTurismo>;
  delete(id: string): Promise<void>;

  // Turistando
  saveTuristando(data: SecretariaTurismoTuristando): Promise<SecretariaTurismoTuristando>;
  findTuristandoById(id: string): Promise<SecretariaTurismoTuristando | null>;
  updateTuristando(id: string, data: Partial<SecretariaTurismoTuristando>): Promise<SecretariaTurismoTuristando>;
  deleteTuristando(id: string): Promise<void>;
  deleteManyTuristandos(ids: string[]): Promise<void>;

  // Projetos
  saveProjeto(data: SecretariaTurismoProjeto): Promise<SecretariaTurismoProjeto>;
  findProjetoById(id: string): Promise<SecretariaTurismoProjeto | null>;
  updateProjeto(id: string, data: Partial<SecretariaTurismoProjeto>): Promise<SecretariaTurismoProjeto>;
  deleteProjeto(id: string): Promise<void>;
  deleteManyProjetos(ids: string[]): Promise<void>;
}

import { SecretariaTurismo } from "../entities/secretariaTurismo.Entity";
import { SecretariaTurismoTuristando } from "../entities/secretariaTurismoTuristando.Entity";
import { SecretariaTurismoProjeto } from "../entities/secretariaTurismoProjeto.Entity";

export interface ISecretariaTurismoRepository {
  save(data: SecretariaTurismo): Promise<SecretariaTurismo>;
  findAll(): Promise<SecretariaTurismo[]>;
  findById(id: string): Promise<SecretariaTurismo | null>;
  update(
    id: string,
    data: Partial<SecretariaTurismo>,
  ): Promise<SecretariaTurismo>;
  delete(id: string): Promise<void>;

  // Métodos para gerir os blocos internos
  saveTuristando(
    data: SecretariaTurismoTuristando,
  ): Promise<SecretariaTurismoTuristando>;
  deleteTuristando(id: string): Promise<void>;

  saveProjeto(
    data: SecretariaTurismoProjeto,
  ): Promise<SecretariaTurismoProjeto>;
  deleteProjeto(id: string): Promise<void>;
}

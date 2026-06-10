import { SecretariaTurismoTuristando } from "./secretariaTurismoTuristando.Entity";
import { SecretariaTurismoProjeto } from "./secretariaTurismoProjeto.Entity";

export class SecretariaTurismo {
  id?: string;
  textoExplicativo!: string;
  videoUrl?: string | null;
  turistandos?: SecretariaTurismoTuristando[];
  projetos?: SecretariaTurismoProjeto[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<SecretariaTurismo>) {
    Object.assign(this, partial);
  }
}

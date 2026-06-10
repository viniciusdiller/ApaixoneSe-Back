export class SecretariaTurismoProjeto {
  id?: string;
  secretariaTurismoId!: string;
  titulo!: string;
  descricao!: string;
  imagemUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<SecretariaTurismoProjeto>) {
    Object.assign(this, partial);
  }
}

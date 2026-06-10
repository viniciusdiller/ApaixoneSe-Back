export class SecretariaTurismoTuristando {
  id?: string;
  secretariaTurismoId!: string;
  titulo!: string;
  texto!: string;
  imagensUrl?: string[] | any;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<SecretariaTurismoTuristando>) {
    Object.assign(this, partial);
  }
}

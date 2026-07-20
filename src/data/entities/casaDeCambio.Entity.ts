export class CasaDeCambio {
  id?: string;
  nome!: string;
  telefone!: string;
  endereco!: string;
  logoUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<CasaDeCambio>) {
    Object.assign(this, partial);
  }
}

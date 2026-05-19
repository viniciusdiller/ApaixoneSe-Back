export class PlanoViagem {
  id?: string;
  titulo!: string;
  dataInicio!: Date;
  dataFim!: Date;
  usuarioId!: string;
  itens?: any[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<PlanoViagem>) {
    Object.assign(this, partial);
  }
}

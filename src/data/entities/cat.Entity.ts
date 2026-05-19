export class Cat {
  id?: string;
  texto!: string;
  arquivoUrl!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<Cat>) {
    Object.assign(this, partial);
  }
}

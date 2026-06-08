export class Cat {
  id?: string;
  texto!: string;
  imagensUrl?: string[] | any;
  videoUrl?: string | null;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<Cat>) {
    Object.assign(this, partial);
  }
}

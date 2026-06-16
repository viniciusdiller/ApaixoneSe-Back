export class FiquePorDentro {
  id?: string;

  // Posição real da imagem na galeria ("1", "2", "3", "4" ou "5")
  ordem!: string;

  imagemUrl!: string;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<FiquePorDentro>) {
    Object.assign(this, partial);
  }
}

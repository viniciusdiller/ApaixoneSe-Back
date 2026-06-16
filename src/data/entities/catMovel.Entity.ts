export class CatMovel {
  id?: string;
  titulo!: string;
  descricao!: string;

  // Mídia: imagem OU vídeo (mutuamente exclusivos)
  imagemUrl?: string | null;
  videoUrl?: string | null;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<CatMovel>) {
    Object.assign(this, partial);
  }
}

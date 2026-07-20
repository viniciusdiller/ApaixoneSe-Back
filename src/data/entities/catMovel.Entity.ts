export class CatMovel {
  id?: string;
  titulo!: string;
  descricao!: string;

  // Mídia: imagem OU vídeo (mutuamente exclusivos)
  imagemUrl?: string | null;
  videoUrl?: string | null;

  // Galeria de imagens exibida em carrossel ao lado da mídia principal
  imagensUrl?: string[] | any;

  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<CatMovel>) {
    Object.assign(this, partial);
  }
}

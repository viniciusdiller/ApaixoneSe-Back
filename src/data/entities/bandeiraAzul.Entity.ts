export type BandeiraAzulBlocoTipo = "text" | "image" | "video";

export interface BandeiraAzulMidia {
  url: string;
  link?: string;
}

export interface BandeiraAzulBloco {
  type: BandeiraAzulBlocoTipo;
  content: string;
  bgColor?: string;
  isBold?: boolean;
  images?: BandeiraAzulMidia[];
  videos?: BandeiraAzulMidia[];
}

export class BandeiraAzul {
  id?: string;
  titulo!: string;
  subtitulo?: string | null;
  bannerImagens?: string[] | null;
  blocos!: BandeiraAzulBloco[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<BandeiraAzul>) {
    Object.assign(this, partial);
  }
}

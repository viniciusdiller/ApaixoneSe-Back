// Importamos o Enum diretamente do Prisma para garantir que usamos as categorias oficiais
import { TipoRoteiro } from "@prisma/client";

export class Atividade {
  public id?: string;
  public titulo: string;
  public descricao: string;
  public local: string;
  public latitude?: number | null; // Float no Prisma vira number no TS
  public longitude?: number | null;
  public imagemUrl?: string | null;
  public roteiro: TipoRoteiro; // O nosso Enum (ex: ESPORTE_E_AVENTURA)
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    props: Omit<Atividade, "id" | "createdAt" | "updatedAt">,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.titulo = props.titulo;
    this.descricao = props.descricao;
    this.local = props.local;
    this.latitude = props.latitude;
    this.longitude = props.longitude;
    this.imagemUrl = props.imagemUrl;
    this.roteiro = props.roteiro;

    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  // A Regra de Negócio Pura: Ninguém entra no sistema se não passar por aqui
  private validate() {
    if (!this.titulo || this.titulo.trim() === "")
      throw new Error("O título da atividade é obrigatório.");
    if (!this.local || this.local.trim() === "")
      throw new Error("O local é obrigatório.");
    if (!this.roteiro) throw new Error("O tipo de roteiro é obrigatório.");
  }
}

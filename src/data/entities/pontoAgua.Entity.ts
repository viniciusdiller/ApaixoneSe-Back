import { TipoPontoAgua } from "@prisma/client";

export class PontoAgua {
  public id?: string;
  public tipo: TipoPontoAgua;
  public nome: string;
  public slug: string;
  public descricaoCurta: string;
  public descricao: string;
  public imagemUrl?: string | null;
  public filtros?: string[] | any;
  public acessivel: boolean;
  public dificuldade?: string | null;
  public estacionamento: boolean;
  public quiosques: boolean;
  public endereco?: string | null;
  public latitude?: number | null;
  public longitude?: number | null;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    props: Omit<PontoAgua, "id" | "createdAt" | "updatedAt">,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.tipo = props.tipo;
    this.nome = props.nome;
    this.slug = props.slug;
    this.descricaoCurta = props.descricaoCurta;
    this.descricao = props.descricao;
    this.imagemUrl = props.imagemUrl;
    this.filtros = props.filtros;
    this.acessivel = props.acessivel;
    this.dificuldade = props.dificuldade;
    this.estacionamento = props.estacionamento;
    this.quiosques = props.quiosques;
    this.endereco = props.endereco;
    this.latitude = props.latitude;
    this.longitude = props.longitude;

    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  private validate() {
    if (!this.tipo) throw new Error("O tipo (PRAIA ou LAGOA) é obrigatório.");
    if (!this.nome || this.nome.trim() === "")
      throw new Error("O nome é obrigatório.");
    if (!this.slug || this.slug.trim() === "")
      throw new Error("O slug é obrigatório.");
  }
}

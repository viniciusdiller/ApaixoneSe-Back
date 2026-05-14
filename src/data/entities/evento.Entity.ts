export class Evento {
  public id?: string;
  public titulo: string;
  public descricao: string;
  public data: Date;
  public local: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    props: Omit<Evento, "id" | "createdAt" | "updatedAt">,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.titulo = props.titulo;
    this.descricao = props.descricao;
    this.data = props.data;
    this.local = props.local;

    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  // A nossa regra de negócio pura:
  private validate() {
    if (!this.titulo || this.titulo.trim() === "")
      throw new Error("O título do evento é obrigatório.");
    if (!this.descricao || this.descricao.trim() === "")
      throw new Error("A descrição do evento é obrigatória.");
    if (!this.data) throw new Error("A data do evento é obrigatória.");
  }
}

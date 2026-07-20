export class LocalCultural {
  public id?: string;
  public nome: string;
  public descricao: string;
  public texto: string;
  public imagemUrl?: string | null;
  public endereco?: string | null;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    props: Omit<LocalCultural, "id" | "createdAt" | "updatedAt">,
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    this.nome = props.nome;
    this.descricao = props.descricao;
    this.texto = props.texto;
    this.imagemUrl = props.imagemUrl;
    this.endereco = props.endereco;

    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;

    this.validate();
  }

  private validate() {
    if (!this.nome || this.nome.trim() === "")
      throw new Error("O nome é obrigatório.");
    if (!this.descricao || this.descricao.trim() === "")
      throw new Error("A descrição é obrigatória.");
    if (!this.texto || this.texto.trim() === "")
      throw new Error("O texto é obrigatório.");
  }
}

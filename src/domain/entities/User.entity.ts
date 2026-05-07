export class User {
  public id?: string;
  public nome: string;
  public usuario: string;
  public email: string;
  public senha: string;
  public pontos: number;
  public createdAt?: Date;

  // O construtor monta o objeto quando o instanciamos
  constructor(
    props: Omit<User, "id" | "createdAt">,
    id?: string,
    createdAt?: Date,
  ) {
    this.id = id;
    this.nome = props.nome;
    this.usuario = props.usuario;
    this.email = props.email;
    this.senha = props.senha;
    this.pontos = props.pontos ?? 0; // Se não passar pontos, começa com 0
    this.createdAt = createdAt ?? new Date();

    this.validate();
  }

  // Regra de negócio pura: um usuário não pode ter email em branco
  private validate() {
    if (!this.nome || this.nome.trim() === "") {
      throw new Error("O nome é obrigatório.");
    }
    if (!this.usuario || this.usuario.trim() === "") {
      throw new Error("O nome de usuário é obrigatório.");
    }
    if (!this.email || !this.email.includes("@")) {
      throw new Error("Email inválido.");
    }
  }
}

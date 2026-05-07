//

export class User {
  public id?: string;
  public nome: string;
  public usuario: string;
  public email: string;
  public senha: string;
  public createdAt?: Date;

  // O construtor é a função que é chamada automaticamente quando fazemos `new User(...)`.
  // Aqui usamos o "Omit" para dizer: "Me passe todos os dados do User, MENOS o id e o createdAt,
  // porque esses dois eu recebo por fora, se existirem".
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
    this.createdAt = createdAt ?? new Date();

    this.validate();
  }

  // 'private' significa que essa função só pode ser chamada por dentro desta própria classe.
  // Nenhum Controller consegue chamar user.validate() de fora.
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

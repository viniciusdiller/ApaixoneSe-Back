import { StatusEstabelecimento } from "@prisma/client";

export class Gastronomia {
  public id?: string;
  public nome: string;
  public telefone: string;
  public instagram?: string | null;
  public endereco: string;
  public especialidade?: string | null;
  public cnpj: string;
  public responsavelNome: string;
  public responsavelCpf: string;
  public documentoPdfUrl: string;
  public logoUrl: string;
  public status: StatusEstabelecimento;
  public usuarioId: string;
  public createdAt?: Date;
  public updatedAt?: Date;

  constructor(
    props: Omit<Gastronomia, "id" | "createdAt" | "updatedAt" | "status"> & {
      status?: StatusEstabelecimento;
    },
    id?: string,
    createdAt?: Date,
    updatedAt?: Date,
  ) {
    Object.assign(this, props);
    this.status = props.status || StatusEstabelecimento.PENDENTE;
    this.id = id;
    this.nome = props.nome;
    this.telefone = props.telefone;
    this.instagram = props.instagram;
    this.endereco = props.endereco;
    this.especialidade = props.especialidade;
    this.cnpj = props.cnpj;
    this.responsavelNome = props.responsavelNome;
    this.responsavelCpf = props.responsavelCpf;
    this.documentoPdfUrl = props.documentoPdfUrl;
    this.logoUrl = props.logoUrl;
    this.usuarioId = props.usuarioId;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

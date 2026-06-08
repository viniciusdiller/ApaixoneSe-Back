import { StatusEstabelecimento } from "@prisma/client";

export class Hospedagem {
  id?: string;
  nome!: string;
  telefone!: string;
  tags?: string[] | any;
  instagram?: string | null;
  site?: string | null;
  endereco!: string;
  textoDiferencial!: string;
  cnpj!: string;
  responsavelNome!: string;
  responsavelCpf!: string;
  documentoPdfUrl!: string;
  logoUrl!: string;
  status!: StatusEstabelecimento;
  usuarioId!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<Hospedagem>) {
    Object.assign(this, partial);
  }
}

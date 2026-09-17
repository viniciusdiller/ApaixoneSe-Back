import { TipoServicoTurista, StatusEstabelecimento } from "@prisma/client";

export class ServicoTurista {
  id?: string;
  tipo!: TipoServicoTurista;
  nome!: string;
  telefone!: string;
  instagram?: string | null;
  site?: string | null;
  validade?: Date | null;
  descricao?: string | null;
  endereco?: string | null;
  cnpj?: string | null;
  roteiros?: string[] | any;
  idiomas?: string | null;
  modalidades?: string[] | any;
  comprovanteUrl?: string | null;
  documentoCnpjUrl?: string | null;
  logoUrl?: string | null;
  fotoUrl?: string | null;
  status!: StatusEstabelecimento;
  termoAceiteEm?: Date | null;
  usuarioId!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<ServicoTurista>) {
    Object.assign(this, partial);
  }
}

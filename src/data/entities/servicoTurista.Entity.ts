import {
  TipoServicoTurista,
  TipoRoteiro,
  StatusEstabelecimento,
} from "@prisma/client";

export class ServicoTurista {
  id?: string;
  tipo!: TipoServicoTurista;
  nome!: string;
  telefone!: string;
  instagram?: string | null;
  site?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  cnpj?: string | null;
  roteiro?: TipoRoteiro | null;
  idiomas?: string | null;
  logoUrl?: string | null;
  fotoUrl?: string | null;
  status!: StatusEstabelecimento;
  usuarioId!: string;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(partial: Partial<ServicoTurista>) {
    Object.assign(this, partial);
  }
}

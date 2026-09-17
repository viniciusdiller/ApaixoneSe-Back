import { AcaoAuditoria } from "@prisma/client";

export class AuditLog {
  id?: string;
  acao!: AcaoAuditoria;
  recurso!: string;
  recursoId?: string | null;
  descricao?: string | null;
  detalhes?: unknown;
  ip?: string | null;
  adminId!: string;
  adminNome!: string;
  createdAt?: Date;

  constructor(partial: Partial<AuditLog>) {
    Object.assign(this, partial);
  }
}

import { AcaoAuditoria } from "@prisma/client";
import { AuditLog } from "../entities/auditLog.Entity";

export interface IAuditLogFiltro {
  adminId?: string;
  acao?: AcaoAuditoria;
  recurso?: string;
  page?: number;
  pageSize?: number;
}

export interface IAuditLogPagina {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface IAuditLogRepository {
  registrar(log: AuditLog): Promise<AuditLog>;
  listar(filtro: IAuditLogFiltro): Promise<IAuditLogPagina>;
}

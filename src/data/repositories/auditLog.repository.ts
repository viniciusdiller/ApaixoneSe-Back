import { Injectable } from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { PrismaService } from "../providers/db/prisma.Service";
import { AuditLog } from "../entities/auditLog.Entity";
import {
  IAuditLogFiltro,
  IAuditLogPagina,
  IAuditLogRepository,
} from "../interfaces/iAuditLog.Interface";

const PAGE_SIZE_PADRAO = 20;
const PAGE_SIZE_MAXIMO = 100;

@Injectable()
export class AuditLogRepository implements IAuditLogRepository {
  constructor(private readonly prisma: PrismaService) {}

  async registrar(log: AuditLog): Promise<AuditLog> {
    const criado = await this.prisma.auditLog.create({
      data: {
        acao: log.acao,
        recurso: log.recurso,
        recursoId: log.recursoId,
        descricao: log.descricao,
        detalhes: log.detalhes as Prisma.InputJsonValue,
        ip: log.ip,
        adminId: log.adminId,
        adminNome: log.adminNome,
      },
    });
    return new AuditLog(criado);
  }

  async listar(filtro: IAuditLogFiltro): Promise<IAuditLogPagina> {
    const page = filtro.page && filtro.page > 0 ? filtro.page : 1;
    const pageSize =
      filtro.pageSize && filtro.pageSize > 0
        ? Math.min(filtro.pageSize, PAGE_SIZE_MAXIMO)
        : PAGE_SIZE_PADRAO;

    const where: Prisma.AuditLogWhereInput = {
      adminId: filtro.adminId,
      acao: filtro.acao,
      recurso: filtro.recurso,
    };

    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      items: items.map((item) => new AuditLog(item)),
      total,
      page,
      pageSize,
    };
  }
}

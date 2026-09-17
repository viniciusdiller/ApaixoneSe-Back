import { Controller, Get, Query, Req, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { AcaoAuditoria } from "@prisma/client";
import { JwtAuthGuard } from "../guards/jwt-autg.guard";
import { AuditLogApplication } from "../../application/applications/auditLog.Application";

@ApiTags("Auditoria (Admin)")
@Controller("audit-log")
export class AuditLogController {
  constructor(private readonly app: AuditLogApplication) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary:
      "Lista o historico de acoes administrativas - aprovar/editar/excluir (apenas Admin)",
  })
  async listar(
    @Req() req: any,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
    @Query("adminId") adminId?: string,
    @Query("acao") acao?: AcaoAuditoria,
    @Query("recurso") recurso?: string,
  ) {
    return this.app.listar(req.user, {
      page: page ? Number(page) : undefined,
      pageSize: pageSize ? Number(pageSize) : undefined,
      adminId,
      acao,
      recurso,
    });
  }
}

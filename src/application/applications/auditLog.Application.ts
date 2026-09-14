import { ForbiddenException, Injectable } from "@nestjs/common";
import { AcaoAuditoria } from "@prisma/client";
import { AuditLogRepository } from "../../data/repositories/auditLog.repository";
import { UserRepository } from "../../data/repositories/user.repository";
import { AuditLog } from "../../data/entities/auditLog.Entity";
import { IAuditLogFiltro } from "../../data/interfaces/iAuditLog.Interface";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

export interface RegistrarAuditLogParams {
  adminId: string;
  acao: AcaoAuditoria;
  recurso: string;
  recursoId?: string | null;
  descricao?: string | null;
  detalhes?: unknown;
  ip?: string | null;
}

@Injectable()
export class AuditLogApplication {
  constructor(
    private readonly repo: AuditLogRepository,
    private readonly userRepo: UserRepository,
  ) {}

  // Chamado pelo AuditLogInterceptor - nunca deve lancar, quem chama trata
  // a falha como "nao quebrar a requisicao do admin".
  async registrar(params: RegistrarAuditLogParams): Promise<void> {
    const admin = await this.userRepo.findById(params.adminId);
    const log = new AuditLog({
      acao: params.acao,
      recurso: params.recurso,
      recursoId: params.recursoId ?? null,
      descricao: params.descricao ?? null,
      detalhes: params.detalhes ?? null,
      ip: params.ip ?? null,
      adminId: params.adminId,
      adminNome: admin?.nome ?? "Desconhecido",
    });
    await this.repo.registrar(log);
  }

  async listar(usuarioLogado: IUsuarioLogado, filtro: IAuditLogFiltro) {
    if (usuarioLogado.perfil !== "ADMIN") {
      throw new ForbiddenException(
        "Apenas administradores podem consultar o log de auditoria.",
      );
    }
    return this.repo.listar(filtro);
  }
}

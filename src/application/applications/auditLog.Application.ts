import { ForbiddenException, Injectable } from "@nestjs/common";
import { AcaoAuditoria } from "@prisma/client";
import { AuditLogRepository } from "../../data/repositories/auditLog.repository";
import { UserRepository } from "../../data/repositories/user.repository";
import { PrismaService } from "../../data/providers/db/prisma.Service";
import { AuditLog } from "../../data/entities/auditLog.Entity";
import { IAuditLogFiltro } from "../../data/interfaces/iAuditLog.Interface";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";
import { extrairNomeLegivel, sanitizarObjeto } from "./auditLog.utils";

export interface SnapshotPreExclusao {
  descricao: string | null;
  detalhes: Record<string, unknown> | null;
}

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
    private readonly prisma: PrismaService,
  ) {}

  // Chamado pelo interceptor ANTES de excluir (o registro so existe agora -
  // depois do delete nao ha mais como saber "o que" foi excluido). Acessa o
  // Prisma diretamente pelo nome do recurso (== nome do model, em camelCase)
  // de proposito: um mapa recurso->repositorio mantido a mao ficaria
  // desatualizado toda vez que um controller novo aparecesse: aqui, cobrimos
  // sozinho. Se o recurso nao bater com nenhum model ou o id nao existir
  // mais, degrada silenciosamente para "sem informacao" - nunca impede a
  // exclusao de fato acontecer.
  async buscarSnapshotAntesDeExcluir(
    recurso: string,
    recursoId: string | null,
  ): Promise<SnapshotPreExclusao> {
    if (!recursoId) return { descricao: null, detalhes: null };

    const delegate = recurso.charAt(0).toLowerCase() + recurso.slice(1);
    try {
      const modelo = (this.prisma as unknown as Record<string, any>)[
        delegate
      ];
      const registro = await modelo?.findUnique?.({
        where: { id: recursoId },
      });
      if (!registro) return { descricao: null, detalhes: null };

      return {
        descricao: extrairNomeLegivel(registro),
        detalhes: sanitizarObjeto(registro) ?? null,
      };
    } catch {
      return { descricao: null, detalhes: null };
    }
  }

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

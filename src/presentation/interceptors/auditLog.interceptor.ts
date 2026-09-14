import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { AcaoAuditoria } from "@prisma/client";
import { AuditLogApplication } from "../../application/applications/auditLog.Application";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

const METODOS_AUDITADOS = ["PUT", "PATCH", "DELETE"];
const CAMPOS_SENSIVEIS = ["senha", "password", "token", "tokenhash"];

/**
 * Registra toda mutacao (aprovar/editar/excluir) feita por um ADMIN, em
 * QUALQUER controller da aplicacao - global, nao precisa de decorator em
 * cada rota. So loga apos o handler responder com sucesso (tap), entao uma
 * tentativa barrada por ForbiddenException/erro nunca vira entrada de log.
 * Falha ao gravar o log nunca deve derrubar a resposta ao admin.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly auditLogApplication: AuditLogApplication) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const usuarioLogado: IUsuarioLogado | undefined = req.user;

    if (!usuarioLogado || usuarioLogado.perfil !== "ADMIN") {
      return next.handle();
    }

    const metodo = String(req.method || "").toUpperCase();
    if (!METODOS_AUDITADOS.includes(metodo)) {
      return next.handle();
    }

    const recurso = context.getClass().name.replace(/Controller$/, "");
    const recursoId: string | null = req.params?.id ?? null;
    const ip: string | null = req.ip ?? null;

    return next.handle().pipe(
      tap(() => {
        // Le req.body só agora: em rotas multipart (FormData) quem
        // preenche req.body é o FileFieldsInterceptor/multer, que roda
        // DEPOIS deste interceptor global (interceptores globais envolvem
        // os locais por fora) - antes de next.handle() o body ainda
        // estaria vazio para essas rotas.
        const acao = this.determinarAcao(metodo, req.body);
        const descricao = this.extrairDescricao(req.body);
        const detalhes = this.sanitizar(req.body);

        this.auditLogApplication
          .registrar({
            adminId: usuarioLogado.id,
            acao,
            recurso,
            recursoId,
            descricao,
            detalhes,
            ip,
          })
          .catch(() => {
            // Falha ao registrar auditoria nunca deve quebrar a
            // requisicao do admin - so deixamos de ter o registro.
          });
      }),
    );
  }

  private determinarAcao(metodo: string, body: any): AcaoAuditoria {
    if (metodo === "DELETE") return AcaoAuditoria.EXCLUIR;
    if (body?.status === "APROVADO") return AcaoAuditoria.APROVAR;
    if (body?.status === "REJEITADO") return AcaoAuditoria.REJEITAR;
    return AcaoAuditoria.EDITAR;
  }

  private extrairDescricao(body: any): string | null {
    if (!body || typeof body !== "object") return null;
    const valor = body.nome ?? body.titulo ?? body.usuario ?? null;
    return typeof valor === "string" ? valor : null;
  }

  private sanitizar(body: any): Record<string, unknown> | undefined {
    if (!body || typeof body !== "object") return undefined;
    const limpo: Record<string, unknown> = {};
    for (const [chave, valor] of Object.entries(body)) {
      if (CAMPOS_SENSIVEIS.includes(chave.toLowerCase())) continue;
      if (Buffer.isBuffer(valor)) continue;
      limpo[chave] = valor;
    }
    return Object.keys(limpo).length > 0 ? limpo : undefined;
  }
}

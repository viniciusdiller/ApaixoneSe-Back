import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from "@nestjs/common";
import { Observable, from, of } from "rxjs";
import { catchError, switchMap, tap } from "rxjs/operators";
import { AcaoAuditoria } from "@prisma/client";
import { AuditLogApplication } from "../../application/applications/auditLog.Application";
import {
  extrairNomeLegivel,
  sanitizarObjeto,
} from "../../application/applications/auditLog.utils";
import { IUsuarioLogado } from "../../data/interfaces/iUsuarioLogado.Interface";

const METODOS_AUDITADOS = ["PUT", "PATCH", "DELETE"];

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

    // Para DELETE, o registro so existe AGORA - depois do handler rodar ele
    // ja foi apagado do banco. Por isso o snapshot (nome + dados) precisa
    // ser capturado ANTES de next.handle(), diferente de PUT/PATCH onde
    // isso vem do proprio body da requisicao (lido depois, ver comentario
    // no tap() abaixo).
    const semSnapshot = { descricao: null, detalhes: null };
    const snapshotPreExclusao$ =
      metodo === "DELETE"
        ? from(
            this.auditLogApplication.buscarSnapshotAntesDeExcluir(
              recurso,
              recursoId,
            ),
          ).pipe(
            // Buscar o snapshot é um "extra" da auditoria - se falhar (o
            // proprio Application já se blinda contra isso, mas nunca
            // confie duas vezes na mesma garantia), a exclusão de verdade
            // tem que acontecer do mesmo jeito.
            catchError(() => of(semSnapshot)),
          )
        : of(semSnapshot);

    return snapshotPreExclusao$.pipe(
      switchMap((snapshot) =>
        next.handle().pipe(
          tap(() => {
            // Le req.body só agora: em rotas multipart (FormData) quem
            // preenche req.body é o FileFieldsInterceptor/multer, que roda
            // DEPOIS deste interceptor global (interceptores globais
            // envolvem os locais por fora) - antes de next.handle() o body
            // ainda estaria vazio para essas rotas.
            const acao = this.determinarAcao(metodo, req.body);
            const descricao =
              metodo === "DELETE"
                ? snapshot.descricao
                : extrairNomeLegivel(req.body);
            const detalhes =
              metodo === "DELETE" ? snapshot.detalhes : sanitizarObjeto(req.body);

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
        ),
      ),
    );
  }

  private determinarAcao(metodo: string, body: any): AcaoAuditoria {
    if (metodo === "DELETE") return AcaoAuditoria.EXCLUIR;
    if (body?.status === "APROVADO") return AcaoAuditoria.APROVAR;
    if (body?.status === "REJEITADO") return AcaoAuditoria.REJEITAR;
    return AcaoAuditoria.EDITAR;
  }
}

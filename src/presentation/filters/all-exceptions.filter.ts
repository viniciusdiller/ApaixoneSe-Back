import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";

export const MENSAGEM_ERRO_INESPERADO =
  "Ocorreu um erro inesperado. Tente novamente em instantes.";

/**
 * Rede de segurança global para qualquer erro não tratado que não seja
 * `HttpException` (nem tenha sido capturado antes pelo `PrismaExceptionFilter`).
 *
 * Evita que o NestJS devolva o texto cru `"Internal server error"` ao cliente
 * e registra a causa real no log do servidor sem vazar detalhes internos.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();
      response
        .status(status)
        .json(
          typeof body === "string" ? { statusCode: status, message: body } : body,
        );
      return;
    }

    const erro = exception as Error | undefined;
    this.logger.error(
      `Erro não tratado em ${request?.method ?? "?"} ${request?.url ?? "?"}: ${erro?.message ?? exception}`,
      erro?.stack,
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: "Internal Server Error",
      message: MENSAGEM_ERRO_INESPERADO,
    });
  }
}

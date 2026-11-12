import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import { Response } from "express";

@Catch(
  Prisma.PrismaClientKnownRequestError,
  Prisma.PrismaClientValidationError,
)
export class PrismaExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(
    exception:
      | Prisma.PrismaClientKnownRequestError
      | Prisma.PrismaClientValidationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof Prisma.PrismaClientValidationError) {
      this.logger.warn(`Erro de validação do Prisma: ${exception.message}`);
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        error: "Bad Request",
        message: "Os dados enviados são inválidos.",
      });
      return;
    }

    switch (exception.code) {
      case "P2002": {
        const target = exception.meta?.target as string[] | string;
        let field = "campo";

        if (Array.isArray(target)) {
          field = target.join(", ");
        } else if (typeof target === "string") {
          // Extrai o nome do campo da string do constraint, ex: "hospedagens_cnpj_key" -> "cnpj"
          const match = target.match(/_([^_]+)_key$/);
          if (match && match[1]) {
            field = match[1];
          } else {
            field = target;
          }
        }

        const message = `Este ${field} já está cadastrado(a).`;

        response.status(HttpStatus.CONFLICT).json({
          statusCode: HttpStatus.CONFLICT,
          error: "Conflict",
          message: [message],
        });
        break;
      }
      case "P2025": {
        response.status(HttpStatus.NOT_FOUND).json({
          statusCode: HttpStatus.NOT_FOUND,
          error: "Not Found",
          message: "Registro não encontrado.",
        });
        break;
      }
      case "P2000": {
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: "Bad Request",
          message: "Um dos campos informados excede o tamanho máximo permitido.",
        });
        break;
      }
      case "P2003": {
        response.status(HttpStatus.BAD_REQUEST).json({
          statusCode: HttpStatus.BAD_REQUEST,
          error: "Bad Request",
          message: "Referência inválida nos dados enviados.",
        });
        break;
      }
      default:
        this.logger.error(
          `Erro Prisma não mapeado (${exception.code}): ${exception.message}`,
        );
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: "Ocorreu um erro interno no banco de dados.",
        });
        break;
    }
  }
}

import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    switch (exception.code) {
      case 'P2002': {
        const target = exception.meta?.target as string[] | string;
        let field = 'campo';
        
        if (Array.isArray(target)) {
          field = target.join(', ');
        } else if (typeof target === 'string') {
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
          error: 'Conflict',
          message: [message],
        });
        break;
      }
      default:
        // Caso ocorram outros erros do Prisma, deixamos passar com 500 ou tratamos especificamente
        response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Ocorreu um erro interno no banco de dados.',
        });
        break;
    }
  }
}

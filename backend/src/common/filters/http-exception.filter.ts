import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Filtre global pour les exceptions HTTP
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: number;
    let message: string;
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        const responseObj = exceptionResponse as Record<string, any>;
        message = responseObj.message || exception.message;

        // Handle validation errors
        if (Array.isArray(responseObj.message)) {
          errors = { validation: responseObj.message };
          message = 'Erreur de validation';
        }
      } else {
        message = exception.message;
      }
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Erreur interne du serveur';

      // Log unexpected errors with more details
      if (exception instanceof Error) {
        const errorMessage = exception.message;
        const errorStack = exception.stack;

        // Check for Prisma errors
        if (errorMessage.includes('Can\'t reach database server') || 
            errorMessage.includes('P1001') ||
            errorMessage.includes('P1000') ||
            errorMessage.includes('P1003')) {
          message = 'Erreur de connexion à la base de données. Vérifiez que PostgreSQL est démarré et que la base de données existe.';
          this.logger.error(`Database connection error: ${errorMessage}`);
        } else if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
          message = 'Les migrations de base de données n\'ont pas été appliquées. Exécutez: npx prisma migrate deploy';
          this.logger.error(`Database migration error: ${errorMessage}`);
        } else {
          this.logger.error(`Unexpected error: ${errorMessage}`, errorStack);
        }
      } else {
        this.logger.error(`Unexpected error: ${exception}`);
      }
    }

    const errorResponse = {
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}

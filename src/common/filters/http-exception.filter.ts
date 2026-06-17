import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const rawResponse = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error';

    // Extract message — may be a string or an object with a message field
    let message: unknown;
    let extra: Record<string, unknown> = {};

    if (typeof rawResponse === 'object' && rawResponse !== null) {
      const { message: msg, ...rest } = rawResponse as Record<string, unknown>;
      message = msg;
      extra   = rest;
    } else {
      message = rawResponse;
    }

    const errorResponse = {
      statusCode: status,
      timestamp:  new Date().toISOString(),
      path:       request.url,
      message:    Array.isArray(message) ? (message as string[]).join(', ') : message,
      ...extra,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : '',
      );
    }

    response.status(status).json(errorResponse);
  }
}

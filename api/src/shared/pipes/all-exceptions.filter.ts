import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message: string | object =
      exception instanceof HttpException
        ? exception.getResponse()
        : String(exception);

    console.error('Exception:', exception);

    const request = ctx.getRequest<Request>();
    const path = httpAdapter.getRequestUrl(request) as string;

    const responseBody = {
      statusCode: httpStatus,
      message,
      timestamp: new Date().toISOString(),
      path,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

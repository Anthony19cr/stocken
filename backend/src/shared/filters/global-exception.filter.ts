import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let code = 'INTERNAL_ERROR'
    let message = 'Error interno del servidor'
    let details: unknown = undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const body = exception.getResponse() as Record<string, unknown>
      code = (body.code as string) ?? 'HTTP_ERROR'
      message = (body.message as string) ?? exception.message
      details = body.details
    }

    if (status >= 500) {
      this.logger.error({
        message: 'Unhandled exception',
        exception,
        path: request.url,
        method: request.method,
      })
    }

    response.status(status).json({
      data: null,
      meta: null,
      error: {
        statusCode: status,
        code,
        message,
        details: process.env.NODE_ENV === 'development' ? details : undefined,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    })
  }
}
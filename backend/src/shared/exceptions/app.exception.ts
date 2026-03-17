import { HttpException } from '@nestjs/common'

export class AppException extends HttpException {
  constructor(
    public readonly code: string,
    message: string,
    public readonly details?: Record<string, unknown>,
    httpStatus: number = 500,
  ) {
    super({ code, message, details }, httpStatus)
  }
}

export class BusinessRuleException extends AppException {
  constructor(code: string, message: string, details?: Record<string, unknown>) {
    super(code, message, details, 422)
  }
}

export class ResourceNotFoundException extends AppException {
  constructor(resource: string, id: string) {
    super('NOT_FOUND', `${resource} con id ${id} no encontrado`, { resource, id }, 404)
  }
}

export class UnauthorizedException extends AppException {
  constructor(message = 'No autorizado') {
    super('UNAUTHORIZED', message, undefined, 401)
  }
}
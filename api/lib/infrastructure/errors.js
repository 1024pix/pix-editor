export class InfrastructureError extends Error {
  constructor(message) {
    super(message);
    this.title = 'Internal Server Error';
    this.status = 500;
  }
}

export class UnprocessableEntityError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Unprocessable entity';
    this.status = 422;
  }
}

export class PreconditionFailedError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Precondition Failed';
    this.status = 421;
  }
}

export class ConflictError extends InfrastructureError {
  constructor(message = 'Conflict between request and server state.') {
    super(message);
    this.title = 'Conflict';
    this.status = 409;
  }
}

export class MissingQueryParamError extends InfrastructureError {
  constructor(missingParamName) {
    const message = `Missing ${missingParamName} query parameter.`;
    super(message);
    this.title = 'Missing Query Parameter';
    this.status = 400;
  }
}

export class NotFoundError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Not Found';
    this.status = 404;
  }
}

export class UnauthorizedError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Unauthorized';
    this.status = 401;
  }
}

export class ForbiddenError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Forbidden';
    this.status = 403;
  }
}

export class BadRequestError extends InfrastructureError {
  constructor(message) {
    super(message);
    this.title = 'Bad Request';
    this.status = 400;
  }
}

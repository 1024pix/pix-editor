class DomainError extends Error {
  constructor(message) {
    super(message);
  }
}

class ForbiddenAccess extends DomainError {
  constructor(message = 'Accès non autorisé.') {
    super(message);
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Erreur, ressource introuvable.') {
    super(message);
  }
}

class UserNotFoundError extends NotFoundError {
  constructor(message = 'Ce compte est introuvable.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        id: ['Ce compte est introuvable.'],
      },
    };
  }
}

class WrongDateFormatError extends DomainError {
  constructor(message = 'Format de date invalide.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        date: ['Veuillez renseigner une date de session au format (jj/mm/yyyy).'],
      },
    };
  }
}

/**
 * @deprecated use InfrastructureError instead for unexpected internal errors
 */
class InternalError extends DomainError {
  constructor() {
    super();
    this.errorStack = [
      'Une erreur interne est survenue.',
    ];
  }

  getErrorMessage() {
    return {
      data: {
        error: this.errorStack,
      },
    };
  }
}

module.exports = {
  DomainError,
  ForbiddenAccess,
  InternalError,
  NotFoundError,
  UserNotFoundError,
  WrongDateFormatError,
};

export class DomainError extends Error {
  constructor(message) {
    super(message);
  }
}

export class NotFoundError extends DomainError {
  constructor(message = 'Erreur, ressource introuvable.') {
    super(message);
  }
}

export class UserNotFoundError extends NotFoundError {
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

export class StaticCourseIsInactiveError extends DomainError {
  constructor(message = 'Opération impossible sur un test statique inactif.') {
    super(message);
  }
}

export class InvalidStaticCourseCreationOrUpdateError extends DomainError {
  constructor() {
    super('Static course validation error at creation or update');
    this.errors = [];
  }

  hasErrors() {
    return this.errors.length > 0;
  }

  addMandatoryFieldError({ field }) {
    this.errors.push({ field, code: 'MANDATORY_FIELD' });
  }

  addUnknownResourcesError({ field, unknownResources }) {
    this.errors.push({ field, data: unknownResources, code: 'UNKNOWN_RESOURCES' });
  }

  addDuplicatesForbiddenError({ field, duplicates }) {
    this.errors.push({ field, data: duplicates, code: 'DUPLICATES_FORBIDDEN' });
  }
}

export class ForbiddenError extends DomainError {}

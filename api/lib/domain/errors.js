class DomainError extends Error {
  constructor(message) {
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

class InvalidStaticCourseCreationOrUpdateError extends DomainError {
  constructor(reasons) {
    super(reasons.join('\n'));
  }
}

module.exports = {
  DomainError,
  InvalidStaticCourseCreationOrUpdateError,
  NotFoundError,
  UserNotFoundError,
};

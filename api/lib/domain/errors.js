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
    return { data: { id: ['Ce compte est introuvable.'] } };
  }
}

export class MissionIntroductionMediaError extends DomainError {
  constructor(message = "Opération impossible car la mission n'a pas de type pour le media d'introduction") {
    super(message);
  }
}

export class InvalidMissionContentError extends DomainError {
  constructor(message) {
    super(message);
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

  addError({ attribute, detail }) {
    this.errors.push({ attribute, detail });
  }
}

export class NotFoundWhitelistedUrlError extends NotFoundError {
  constructor(message) {
    super(message);
  }
}

export class CommandWhitelistedUrlConflictError extends DomainError {
  constructor(message) {
    super(message);
  }
}

export class CommandWhitelistedUrlForbiddenError extends DomainError {
  constructor(message) {
    super(message);
  }
}

export class CommandWhitelistedUrlError extends DomainError {
  constructor({ message, attribute = 'irrelevant' }) {
    super(message);
    this.attribute = attribute;
  }
}

export class TagTitleAlreadyUsedError extends DomainError {
  constructor(title) {
    super(`Echec de création du tag : le titre "${title}" est déjà pris"`);
  }
}

export class CloneSkillError extends DomainError {
  constructor(message) {
    super(message);
  }
}

export class ForbiddenError extends DomainError {}

export class InvalidLocalizedFrameworkTubesError extends DomainError {
  constructor(message) {
    super(message);
  }
}

export class EmbedAlreadyExistsError extends DomainError {
  constructor(name) {
    super(`Un embed avec le nom "${name}" existe déjà`);
  }
}

const _ = require('lodash');
const CommandResult = require('../CommandResult');
const { InvalidStaticCourseCreationOrUpdateError } = require('../errors');

module.exports = class StaticCourse {
  constructor({
    id,
    name,
    description,
    challengeIds,
    isActive,
    deactivationReason,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.isActive = isActive;
    this.deactivationReason = deactivationReason;
    this.challengeIds = challengeIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // idGenerator : (prefix: string) => string
  static buildFromCreationCommand({ creationCommand, allChallengeIds, idGenerator }) {
    const timestamp = new Date();
    const attributes = {
      name: creationCommand.name.trim(),
      description: creationCommand.description.trim(),
      challengeIds: creationCommand.challengeIds.map((challengeId) => challengeId.trim()),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const validationError = validateAttributes(attributes, allChallengeIds);
    if (validationError.hasErrors()) {
      return CommandResult.Failure({ value: null, error: validationError });
    }
    const staticCourse = new StaticCourse({ ...attributes, id: idGenerator('course'), isActive: true, deactivationReason: '' });
    return CommandResult.Success({ value: staticCourse });
  }

  update({ updateCommand, allChallengeIds }) {
    const timestamp = new Date();
    const attributes = {
      id: this.id,
      name: updateCommand.name.trim(),
      description: updateCommand.description.trim(),
      isActive: this.isActive,
      deactivationReason: this.deactivationReason,
      challengeIds: updateCommand.challengeIds.map((challengeId) => challengeId.trim()),
      createdAt: this.createdAt,
      updatedAt: timestamp,
    };
    const validationError = validateAttributes(attributes, allChallengeIds);
    if (validationError.hasErrors()) {
      return CommandResult.Failure({ value: null, error: validationError });
    }
    const staticCourse = new StaticCourse(attributes);
    return CommandResult.Success({ value: staticCourse });
  }

  deactivate(deactivationCommand) {
    const timestamp = new Date();

    const attributes = {
      id: this.id,
      name: this.name,
      description: this.description,
      isActive: false,
      deactivationReason: deactivationCommand.reason,
      challengeIds: this.challengeIds,
      createdAt: this.createdAt,
      updatedAt: timestamp,
    };
    const staticCourse = new StaticCourse(attributes);
    return CommandResult.Success({ value: staticCourse });
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      deactivationReason: this.deactivationReason,
      challengeIds: this.challengeIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
};

function validateAttributes({ name, challengeIds }, allChallengeIds) {
  const validationError = new InvalidStaticCourseCreationOrUpdateError();
  checkName(name, validationError);
  checkChallengeIds(challengeIds, allChallengeIds, validationError);
  return validationError;
}

function checkName(name, validationError) {
  if (name.length === 0) {
    validationError.addMandatoryFieldError({ field: 'name' });
  }
}

function checkChallengeIds(challengeIds, allChallengeIds, validationError) {
  if (challengeIds.length === 0) {
    validationError.addMandatoryFieldError({ field: 'challengeIds' });
    return;
  }

  const notFoundChallengeIds = _.difference(challengeIds, allChallengeIds);
  if (notFoundChallengeIds.length > 0) {
    validationError.addUnknownResourcesError({ field: 'challengeIds', unknownResources: notFoundChallengeIds });
  }

  const challengeOccurrencesMap = _.countBy(challengeIds);
  const duplicateChallengeIds = [];
  for (const [challengeId, occurrences] of Object.entries(challengeOccurrencesMap)) {
    if (occurrences > 1) {
      duplicateChallengeIds.push(challengeId);
    }
  }
  if (duplicateChallengeIds.length > 0) {
    validationError.addDuplicatesForbiddenError({ field: 'challengeIds', duplicates: duplicateChallengeIds });
  }
}

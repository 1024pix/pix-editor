import _ from 'lodash';
import { CommandResult } from '../CommandResult.js';
import { InvalidStaticCourseCreationOrUpdateError, StaticCourseIsInactiveError } from '../errors.js';

export class StaticCourse {
  constructor({
    id,
    name,
    description,
    challengeIds,
    tagIds,
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
    this.tagIds = tagIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // idGenerator : (prefix: string) => string
  static buildFromCreationCommand({ creationCommand, allChallengeIds, allTagIds, idGenerator }) {
    const timestamp = new Date();
    const attributes = {
      name: creationCommand.name.trim(),
      description: creationCommand.description.trim(),
      challengeIds: creationCommand.challengeIds.map((challengeId) => challengeId.trim()),
      tagIds: creationCommand.tagIds,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const validationError = validateAttributes(attributes, allChallengeIds, allTagIds);
    if (validationError.hasErrors()) {
      return CommandResult.Failure({ value: null, error: validationError });
    }
    const staticCourse = new StaticCourse({ ...attributes, id: idGenerator('course'), isActive: true, deactivationReason: '' });
    return CommandResult.Success({ value: staticCourse });
  }

  update({ updateCommand, allChallengeIds, allTagIds }) {
    if (!this.isActive) {
      return CommandResult.Failure({ value: null, error: new StaticCourseIsInactiveError() });
    }
    const timestamp = new Date();
    const attributes = {
      id: this.id,
      name: updateCommand.name.trim(),
      description: updateCommand.description.trim(),
      isActive: this.isActive,
      deactivationReason: this.deactivationReason,
      challengeIds: updateCommand.challengeIds.map((challengeId) => challengeId.trim()),
      tagIds: updateCommand.tagIds,
      createdAt: this.createdAt,
      updatedAt: timestamp,
    };
    const validationError = validateAttributes(attributes, allChallengeIds, allTagIds);
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
      tagIds: this.tagIds,
      createdAt: this.createdAt,
      updatedAt: timestamp,
    };
    const staticCourse = new StaticCourse(attributes);
    return CommandResult.Success({ value: staticCourse });
  }

  reactivate() {
    const timestamp = new Date();

    const attributes = {
      id: this.id,
      name: this.name,
      description: this.description,
      isActive: true,
      deactivationReason: '',
      challengeIds: this.challengeIds,
      tagIds: this.tagIds,
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
      tagIds: this.tagIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

function validateAttributes({ name, challengeIds, tagIds }, allChallengeIds, allTagIds) {
  const validationError = new InvalidStaticCourseCreationOrUpdateError();
  checkName(name, validationError);
  checkChallengeIds(challengeIds, allChallengeIds, validationError);
  checkTagIds(tagIds, allTagIds, validationError);
  return validationError;
}

function checkName(name, validationError) {
  if (name.length === 0) {
    validationError.addError({ attribute: 'name', detail: 'Le champ "Nom" est obligatoire' });
  }
}

function checkChallengeIds(challengeIds, allChallengeIds, validationError) {
  if (challengeIds.length === 0) {
    validationError.addError({ attribute: 'challengeIds', detail: 'Le champ "IDs des épreuves" est obligatoire' });
    return;
  }

  const notFoundChallengeIds = _.difference(challengeIds, allChallengeIds);
  if (notFoundChallengeIds.length > 0) {
    validationError.addError({ attribute: 'challengeIds', detail: `Les IDs d'épreuve suivants n'existent pas : ${notFoundChallengeIds.join(', ')}` });
  }

  const challengeOccurrencesMap = _.countBy(challengeIds);
  const duplicateChallengeIds = [];
  for (const [challengeId, occurrences] of Object.entries(challengeOccurrencesMap)) {
    if (occurrences > 1) {
      duplicateChallengeIds.push(challengeId);
    }
  }
  if (duplicateChallengeIds.length > 0) {
    validationError.addError({ attribute: 'challengeIds', detail: `Les IDs d'épreuve suivants sont en doublon : ${duplicateChallengeIds.join(', ')}` });
  }
}

function checkTagIds(tagIds, allTagIds, validationError) {

  const notFoundTagIds = _.difference(tagIds, allTagIds);
  if (notFoundTagIds.length > 0) {
    validationError.addError({ attribute: 'tagIds', detail: `Les tags suivants n'existent pas : ${notFoundTagIds.join(', ')}` });
  }

  const tagOccurrencesMap = _.countBy(tagIds);
  const duplicateTagIds = [];
  for (const [tagId, occurrences] of Object.entries(tagOccurrencesMap)) {
    if (occurrences > 1) {
      duplicateTagIds.push(tagId);
    }
  }
  if (duplicateTagIds.length > 0) {
    validationError.addError({ attribute: 'tagIds', detail: `Les tags suivants sont en doublon : ${duplicateTagIds.join(', ')}` });
  }
}

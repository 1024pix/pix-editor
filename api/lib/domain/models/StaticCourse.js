const _ = require('lodash');
const CommandResult = require('../CommandResult');

module.exports = class StaticCourse {
  constructor({
    id,
    name,
    description,
    challengeIds,
    createdAt,
    updatedAt,
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.challengeIds = challengeIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  // idGenerator : (prefix: string) => string
  static buildFromCreationCommand({ creationCommand, allChallengeIds, idGenerator }) {
    const failureReasons = [];
    const timestamp = new Date();
    const attributes = {
      name: creationCommand.name.trim(),
      description: creationCommand.description.trim(),
      challengeIds: creationCommand.challengeIds.map((challengeId) => challengeId.trim()),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    checkName(attributes.name, failureReasons);
    checkChallengeIds(attributes.challengeIds, allChallengeIds, failureReasons);
    if (failureReasons.length > 0) {
      return CommandResult.Failure({ value: null, failureReasons });
    }
    const staticCourse = new StaticCourse({ ...attributes, id: idGenerator('course') });
    return CommandResult.Success({ value: staticCourse });
  }

  update({ updateCommand, allChallengeIds }) {
    const failureReasons = [];
    const timestamp = new Date();
    const attributes = {
      id: this.id,
      name: updateCommand.name.trim(),
      description: updateCommand.description.trim(),
      challengeIds: updateCommand.challengeIds.map((challengeId) => challengeId.trim()),
      createdAt: this.createdAt,
      updatedAt: timestamp,
    };
    checkName(attributes.name, failureReasons);
    checkChallengeIds(attributes.challengeIds, allChallengeIds, failureReasons);
    if (failureReasons.length > 0) {
      return CommandResult.Failure({ value: null, failureReasons });
    }
    const staticCourse = new StaticCourse(attributes);
    return CommandResult.Success({ value: staticCourse });
  }

  toDTO() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      challengeIds: this.challengeIds,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
};

function checkName(name, failureReasons) {
  if (name.length === 0) {
    failureReasons.push('Invalid or empty "name"');
  }
}

function checkChallengeIds(challengeIds, allChallengeIds, failureReasons) {
  if (challengeIds.length === 0) {
    failureReasons.push('No challenges provided');
    return;
  }

  const notFoundChallenges = _.difference(challengeIds, allChallengeIds);
  if (notFoundChallenges.length > 0) {
    failureReasons.push(`Following challenges do not exist : ${notFoundChallenges.map((id) => `"${id}"`).join(', ')}`);
  }

  const challengeOccurrencesMap = _.countBy(challengeIds);
  const duplicateChallenges = [];
  for (const [challengeId, occurrences] of Object.entries(challengeOccurrencesMap)) {
    if (occurrences > 1) {
      duplicateChallenges.push(challengeId);
    }
  }
  if (duplicateChallenges.length > 0) {
    failureReasons.push(`Following challenges appear more than once : ${duplicateChallenges.map((id) => `"${id}"`).join(', ')}`);
  }
}

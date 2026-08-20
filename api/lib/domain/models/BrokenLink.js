export class BrokenLink {
  constructor({
    challengeStatuses,
    competenceNames,
    crawledUrl,
    entityIds,
    entityType,
    errorMessage,
    frameworkNames,
    skillNames,
    statusCode,
  }) {
    this.challengeStatuses = challengeStatuses;
    this.competenceNames = competenceNames;
    this.crawledUrl = crawledUrl;
    this.entityIds = entityIds;
    this.entityType = entityType;
    this.errorMessage = errorMessage;
    this.frameworkNames = frameworkNames;
    this.skillNames = skillNames;
    this.statusCode = statusCode;
  }
}

export class WhitelistedUrl {
  constructor({
    id,
    createdAt,
    updatedAt,
    creatorName,
    latestUpdatorName,
    url,
    relatedSkillNames,
    comment,
    checkType,
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.creatorName = creatorName;
    this.latestUpdatorName = latestUpdatorName;
    this.url = url;
    this.relatedSkillNames = relatedSkillNames;
    this.comment = comment;
    this.checkType = checkType;
  }
}

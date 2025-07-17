
export default class WhitelistedUrl {
  constructor(
    {id,
    url,
    creatorName,
    latestUpdatorName,
    relatedSkillNames,
    checkType,
    comment,
    createdAt,
    updatedAt}
  ) {
    this.id = id;
    this.url = url;
    this.creatorName = creatorName;
    this.latestUpdatorName = latestUpdatorName;
    this.relatedSkillNames = relatedSkillNames;
    this.checkType = checkType;
    this.comment = comment;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
}

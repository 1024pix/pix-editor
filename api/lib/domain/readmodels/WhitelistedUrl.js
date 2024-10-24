export class WhitelistedUrl {
  constructor({
    id,
    createdAt,
    updatedAt,
    creatorName,
    latestUpdatorName,
    url,
    relatedEntityIds,
    comment,
  }) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.creatorName = creatorName;
    this.latestUpdatorName = latestUpdatorName;
    this.url = url;
    this.relatedEntityIds = relatedEntityIds;
    this.comment = comment;
  }
}

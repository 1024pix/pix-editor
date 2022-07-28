module.exports = class Training {
  constructor({
    id,
    title,
    link,
    type,
    duration,
    locale,
    targetProfileIds,
    createdAt,
    updatedAt
  } = {}) {
    this.id = id;
    this.title = title;
    this.link = link;
    this.type = type;
    this.duration = duration;
    this.locale = locale;
    this.targetProfileIds = targetProfileIds;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }
};

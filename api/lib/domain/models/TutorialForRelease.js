module.exports = class TutorialForRelease {
  constructor({
    id,
    duration,
    format,
    link,
    source,
    title,
    locale,
  }) {
    this.id = id;
    this.duration = duration;
    this.format = format;
    this.link = link;
    this.source = source;
    this.title = title;
    this.locale = locale;
  }
};

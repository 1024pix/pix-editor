export class ModuleForReplication {
  constructor({
    id,
    shortId,
    slug,
    title,
    internalTitle,
    isBeta,
    visibility,
    level,
    duration,
    objectives,
    version,
  } = {}) {
    this.id = id;
    this.shortId = shortId;
    this.slug = slug;
    this.title = title;
    this.internalTitle = internalTitle;
    this.isBeta = isBeta;
    this.visibility = visibility;
    this.level = level;
    this.duration = duration;
    this.objectives = objectives;
    this.version = version;
  }
}

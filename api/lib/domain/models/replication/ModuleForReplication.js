export class ModuleForReplication {
  constructor({
    id,
    shortId,
    slug,
    title,
    isBeta,
    visibility,
    level,
    duration,
    objectives,
  } = {}) {
    this.id = id;
    this.shortId = shortId;
    this.slug = slug;
    this.title = title;
    this.isBeta = isBeta;
    this.visibility = visibility;
    this.level = level;
    this.duration = duration;
    this.objectives = objectives;
  }
}

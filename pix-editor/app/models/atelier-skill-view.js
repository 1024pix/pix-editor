import Model, { attr, hasMany } from '@ember-data/model';

export default class AtelierSkillViewModel extends Model {

  @attr name;
  @attr level;
  @attr validatedPrototypesCount;
  @attr proposedPrototypesCount;
  @attr archivedPrototypesCount;
  @attr obsoletePrototypesCount;

  @hasMany('atelier-skill-version-views') atelierSkillVersionViews;

}

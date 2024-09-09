import Model, { attr, hasMany } from '@ember-data/model';

export default class AtelierSkillViewModel extends Model {

  @attr name;
  @attr level;

  @hasMany('atelier-skill-version-views') atelierSkillVersionViews;

}

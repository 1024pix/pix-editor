import Model, { attr, hasMany } from '@ember-data/model';

export default class TubeOverviewModel extends Model {

  @attr name;

  @hasMany('en-construction-skill-views') enConstructionSkillViews;
  @hasMany('atelier-skill-views') atelierSkillViews;
  @hasMany('en-production-skill-views') enProductionSkillViews;

}

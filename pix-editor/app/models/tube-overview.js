import Model, { attr, hasMany } from '@ember-data/model';

export default class TubeOverviewModel extends Model {

  @attr name;
  @attr airtableId;
  @attr index;

  @hasMany('en-construction-skill-views') enConstructionSkillViews;
  @hasMany('atelier-skill-views') atelierSkillViews;
  @hasMany('en-production-skill-views') enProductionSkillViews;

}

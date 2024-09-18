import Model, { attr, hasMany } from '@ember-data/model';

export default class CompetenceOverviewModel extends Model {

  @attr name;
  @attr airtableId;
  @attr locale;

  @hasMany('thematic-overviews') thematicOverviews;

}

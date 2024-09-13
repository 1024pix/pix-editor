import Model, { attr, hasMany } from '@ember-data/model';

export default class ThematicOverviewModel extends Model {

  @attr name;
  @attr airtableId;

  @hasMany('tube-overviews') tubeOverviews;

}

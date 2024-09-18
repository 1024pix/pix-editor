import Model, { attr, hasMany } from '@ember-data/model';

export default class ThematicOverviewModel extends Model {

  @attr name;
  @attr airtableId;
  @attr index;

  @hasMany('tube-overviews') tubeOverviews;

}

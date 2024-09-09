import Model, { attr, hasMany } from '@ember-data/model';

export default class ThematicOverviewModel extends Model {

  @attr name;

  @hasMany('tube-overviews') tubeOverviews;

}

import Model, { attr } from '@ember-data/model';

export default class BrokenUrlModel extends Model {
  @attr url;
}

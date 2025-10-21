import Model, { attr } from '@ember-data/model';

export default class AdminEntityModel extends Model {
  @attr type;
  @attr properties;
}

import Model, { attr } from '@ember-data/model';

export default class ApiModel extends Model {
  @attr version;
}

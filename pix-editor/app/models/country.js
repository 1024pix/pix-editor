import Model, { attr } from '@ember-data/model';

export default class Country extends Model {
  @attr code;
  @attr name;
}

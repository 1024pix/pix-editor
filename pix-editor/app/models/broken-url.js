import Model, { attr } from '@ember-data/model';

export default class BrokenUrlModel extends Model {
  @attr errorMessage;
  @attr statusCode;
  @attr url;
  @attr challenges;
  @attr tutorials;
}

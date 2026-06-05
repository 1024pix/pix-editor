import Model, { attr } from '@ember-data/model';

export default class DraftModuleDiff extends Model {
  @attr htmlDiff;
}

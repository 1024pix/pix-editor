import Model, { attr } from '@ember-data/model';

export default class ChallengeSummaryModel extends Model {
  @attr instruction;
  @attr skillName;
  @attr status;
  @attr index;

  get indexForDisplay() {
    return this.index + 1;
  }
}

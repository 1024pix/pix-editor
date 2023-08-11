import Model, { attr } from '@ember-data/model';

export default class ChallengeSummaryModel extends Model {
  @attr instruction;
  @attr skillName;
  @attr status;
  @attr index;
  @attr previewUrl;

  get indexForDisplay() {
    return this.index + 1;
  }
}

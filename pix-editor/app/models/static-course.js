import Model, { attr, hasMany } from '@ember-data/model';

export default class StaticCourseModel extends Model {
  @attr name;
  @attr description;
  @attr createdAt;
  @attr updatedAt;

  @hasMany('challenge-summary') challengeSummaries;

  get previewURL() {
    return `https://app.recette.pix.fr/courses/${this.id}`;
  }

  get sortedChallengeSummaries() {
    return this.challengeSummaries.sortBy('index');
  }

  // TODO : i hate this approach pls help
  get challengeIdsAsStringWithBreakLines() {
    return this.sortedChallengeSummaries.toArray()
      .map((challengeSummary) => challengeSummary.id)
      .join('\n');
  }
}

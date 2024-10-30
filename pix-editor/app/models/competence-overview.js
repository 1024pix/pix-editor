import Model, { attr } from '@ember-data/model';

export default class CompetenceOverviewModel extends Model {

  @attr() thematicOverviews;

  // FIXME compute in route
  get tubesCount() {
    return this.thematicOverviews.reduce((tubesCount, thematicOverview) => {
      return tubesCount + thematicOverview.tubeOverviews.length;
    }, 0);
  }

  // FIXME compute in route
  get skillsCount() {
    return this.thematicOverviews.reduce((skillsCount, thematicOverview) => {
      return skillsCount + thematicOverview.tubeOverviews.reduce((tubeSkillsCount, tubeOverview) => {
        return tubeSkillsCount + tubeOverview.skillOverviews.filter((skillOverview) => skillOverview !== null).length;
      }, 0);
    }, 0);
  }
}

import Model, { attr } from '@ember-data/model';

export default class CompetenceOverviewModel extends Model {
  @attr() thematicOverviews;
  @attr('number') tubesCount;
  @attr('number') skillsCount;
}

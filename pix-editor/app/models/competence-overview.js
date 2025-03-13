import Model, { attr } from '@ember-data/model';

export default class CompetenceOverviewModel extends Model {
  @attr() airtableId;
  @attr() name;
  @attr() thematicOverviews;
  @attr('number') tubesCount;
  @attr('number') skillsCount;

  get competencePixId() {
    return this.id.split(':')[0];
  }

  get view() {
    return this.id.split(':')[1].split('-')[1];
  }

  get locale() {
    return this.id.split(':')[2];
  }

  get competenceAirtableId() {
    return this.airtableId;
  }
}

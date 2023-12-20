import Model, { attr } from '@ember-data/model';

export default class MissionSummary extends Model {
  @attr name;
  @attr competence;
  @attr createdAt;
  @attr status;

  get isActive() {
    return this.status === 'ACTIVE';
  }
}

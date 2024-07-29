import Model, { attr } from '@ember-data/model';

export default class MissionSummary extends Model {
  @attr name;
  @attr competence;
  @attr createdAt;
  @attr status;

  static get statuses () {
    return {
      VALIDATED: 'VALIDATED',
      EXPERIMENTAL: 'EXPERIMENTAL',
      INACTIVE: 'INACTIVE',
    };
  }

  static get displayableStatuses () {
    return {
      VALIDATED: 'Validée',
      EXPERIMENTAL: 'Expérimentale',
      INACTIVE: 'Inactive',
    };
  }

  get displayableStatus () {
    return MissionSummary.displayableStatuses[this.status];
  }

  get statusColor () {
    if (this.isExperimental) return 'secondary';
    if (this.isValidated) return 'green-light';
    return 'grey-light';
  }

  get isExperimental () {
    return this.status === MissionSummary.statuses.EXPERIMENTAL;

  }

  get isValidated () {
    return this.status === MissionSummary.statuses.VALIDATED;
  }

  get isInactive () {
    return !this.isExperimental && !this.isValidated;
  }
}

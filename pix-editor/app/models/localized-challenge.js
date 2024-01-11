import Model, { attr, belongsTo } from '@ember-data/model';

const inProductionCombinations = [
  'validé:validé',
  'archivé:proposé',
  'archivé:validé',
];

export default class LocalizedChallengeModel extends Model {
  @attr embedURL;
  @attr locale;
  @attr status;

  @belongsTo('challenge') challenge;

  get isPrimaryChallenge() {
    return this.challenge.get('id') === this.id;
  }

  get statusCSS() {
    return this.isInProduction ? 'validated' : 'suggested';
  }

  get statusText() {
    return this.isInProduction ? 'En prod' : 'Pas en prod';
  }

  get isInProduction() {
    return inProductionCombinations.includes(`${this.challenge.get('status')}:${this.status}`);
  }

  get isStatusEditable() {
    return ['validé', 'archivé'].includes(this.challenge.get('status'));
  }
}

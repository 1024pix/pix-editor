import Model, { attr } from '@ember-data/model';

const skillStatusIcon = {
  actif: '🟢',
  'en construction': '🔵',
  archivé: '⬜️',
  périmé: '🔴',
  '': '❓',
};

const challengeStatusIcon = {
  validé: '🟢',
  proposé: '🔵',
  archivé: '⬜️',
  périmé: '🔴',
  '': '❓',
};

export default class SearchResult extends Model {
  @attr type;
  @attr status;
  @attr title;
  @attr locale;
  @attr isPrimary;
  @attr version;

  get #routeForType() {
    if (this.type === 'skill') return 'authenticated.skill';
    if (this.type === 'challenge') return 'authenticated.challenge';
    throw new TypeError(`unknown search result type "${this.type}"`);
  }

  get transition() {
    return [this.#routeForType, this.id];
  }

  get statusIcon() {
    if (this.type === 'skill') return skillStatusIcon[this.status];
    if (this.type === 'challenge') return challengeStatusIcon[this.status];
    throw new TypeError(`unknown search result type "${this.type}"`);
  }
}

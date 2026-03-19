import Model, { attr, belongsTo } from '@ember-data/model';
import Challenge from 'pixeditor/models/challenge';
import LocalizedChallenge from 'pixeditor/models/localized-challenge';

const PRIMARY_IN_LOCALE_STATUS = 'PRIMARY_IN_LOCALE';
const NOT_TRANSLATED_STATUS = 'NOT_TRANSLATED';

export default class ChallengeLocaleModel extends Model {
  @attr locale;

  @belongsTo('challenge', { inverse: 'challengeLocales', async: false }) challenge;
  @belongsTo('localized-challenge', { inverse: null, async: true }) localizedChallenge;

  get localizedChallengeValue() {
    return this.belongsTo('localizedChallenge').value();
  }

  get localizedChallengeId() {
    return this.localizedChallengeValue?.id;
  }

  get isPrimaryInLocale() {
    return this.challenge.locales.map((locale) => Intl.getCanonicalLocales(locale).toString()).includes(this.locale);
  }

  get isPrototype() {
    return this.challenge.isPrototype;
  }

  get alternativeVersion() {
    return this.isPrototype ? 'Proto' : this.challenge.alternativeVersion;
  }

  get version() {
    return this.challenge.version;
  }

  get instruction() {
    return this.localizedChallengeValue?.instruction ?? this.challenge.instruction;
  }

  get primaryUpdatedAt() {
    return this.challenge.updatedAt;
  }

  get primaryAuthor() {
    return this.challenge.author;
  }

  get primaryStatus() {
    return this.challenge.status;
  }

  get primaryComputedStatus() {
    return this.challenge.computedStatus;
  }

  get status() {
    if (this.isPrimaryInLocale) return PRIMARY_IN_LOCALE_STATUS;
    return this.localizedChallengeValue?.status ?? NOT_TRANSLATED_STATUS;
  }

  get primaryPreviewUrl() {
    return this.challenge.previewUrl;
  }

  get localizedPreviewUrl() {
    if (this.isPrimaryInLocale || !this.localizedChallengeValue) return null;
    return `${this.primaryPreviewUrl}?locale=${this.localizedChallengeValue.locale}`;
  }

  get translationsUrl() {
    if (this.isPrimaryInLocale) return null;
    if (this.locale === 'fr-fr') return null;
    return `/api/challenges/${this.challenge.id}/translations/${this.locale}`;
  }

  get isTranslated() {
    return !this.isPrimaryInLocale && !!this.localizedChallengeValue;
  }

  get primaryStatusColor() {
    if (this.primaryStatus === Challenge.STATUSES.PROPOSE) {
      return 'blue';
    }
    if (this.primaryStatus === Challenge.STATUSES.VALIDE) {
      return 'green';
    }
    if (this.primaryStatus === Challenge.STATUSES.ARCHIVE) {
      return 'grey';
    }
    if (this.primaryStatus === Challenge.STATUSES.PERIME) {
      return 'red';
    }
    return 'yellow';
  }

  get primaryStatusText() {
    return this.primaryComputedStatus ?? 'absence de statut ❓';
  }

  get localizedStatusColor() {
    if (this.status === LocalizedChallenge.STATUSES.PLAY) {
      return 'green';
    }
    if (this.status === LocalizedChallenge.STATUSES.PAUSE) {
      return 'yellow';
    }
    if (this.status === PRIMARY_IN_LOCALE_STATUS) {
      return 'grey';
    }
    if (this.status === NOT_TRANSLATED_STATUS) {
      return 'blue';
    }
    return 'orange';
  }

  get localizedStatusText() {
    if (this.status === LocalizedChallenge.STATUSES.PLAY) {
      return 'En prod';
    }
    if (this.status === LocalizedChallenge.STATUSES.PAUSE) {
      return 'En pause';
    }
    if (this.status === PRIMARY_IN_LOCALE_STATUS) {
      return 'Source dans la langue';
    }
    if (this.status === NOT_TRANSLATED_STATUS) {
      return 'Pas traduit';
    }
    return 'absence de statut ❓';
  }
}

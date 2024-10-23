import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

import Alternative from './single';

export default class NewController extends Alternative {
  creation = true;
  queryParams = ['from'];
  @tracked from = '';
  @service currentData;
  @service loader;
  @service router;
  @service store;

  defaultSaveChangelog = 'Création de la déclinaison';

  @action
  cancelEdit() {
    this.edition = false;
    this._message('Création annulée');
    this.parentController.send('closeChildComponent');
    this.store.deleteRecord(this.challenge);
  }

  @action
  async save() {
    this.loader.start();
    try {
      await this._handleIllustration(this.challenge);
      await this._handleAttachments(this.challenge);
      // create challenge without patching Pix API cache
      this._setAlternativeVersion(this.challenge);
      await this._saveChallenge(this.challenge);
      await this._saveFiles(this.challenge);
      // refresh Pix API cache (only done on PATCH route)
      await this._saveChallenge(this.challenge);
      this.edition = false;
      this.send('minimize');
      this._message(`Déclinaison numéro ${this.challenge.alternativeVersion} enregistrée`);
      this.router.transitionTo('authenticated.competence.prototypes.single.alternatives.single', this.currentData.getCompetence(), this.currentData.getPrototype(), this.challenge.id);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this._errorMessage('Erreur lors de la création');
    } finally {
      this.loader.stop();
    }
  }

  _setAlternativeVersion(challenge) {
    const version = this.currentData.getPrototype().getNextAlternativeVersion();
    challenge.alternativeVersion = version;
  }
}

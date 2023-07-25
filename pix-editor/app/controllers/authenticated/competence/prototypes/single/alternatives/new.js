import Alternative from './single';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/ember';

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
  save() {
    this.loader.start();
    return this._handleIllustration(this.challenge)
      .then(challenge => this._handleAttachments(challenge))
      .then(challenge => this._saveChallenge(challenge))
      .then(challenge => this._setAlternativeVersion(challenge))
      .then(challenge => this._saveAttachments(challenge))
      .then(challenge => {
        this.edition = false;
        this.send('minimize');
        this._message(`Déclinaison numéro ${challenge.alternativeVersion} enregistrée`);
        this.router.transitionTo('authenticated.competence.prototypes.single.alternatives.single', this.currentData.getCompetence(), this.currentData.getPrototype(), challenge);
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this._errorMessage('Erreur lors de la création');
      })
      .finally(() => this.loader.stop());
  }

  _setAlternativeVersion(challenge) {
    const skill = challenge.skill;
    return skill.reload()
      .then(() => this.currentData.getPrototype().getNextAlternativeVersion())
      .then(version => {
        challenge.alternativeVersion = version;
        return challenge.save();
      });
  }
}

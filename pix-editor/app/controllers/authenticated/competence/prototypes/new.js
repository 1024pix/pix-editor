import Prototype from './single';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import * as Sentry from '@sentry/ember';

export default class NewController extends Prototype {

  creation = true;
  queryParams = ['from', 'fromSkill'];
  @tracked from = '';
  @service currentData;
  @service loader;
  @service router;
  @service store;

  defaultSaveChangelog = 'Création du prototype';

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
      // create challenge without patching Pix API cache
      .then(challenge => this._saveChallenge(challenge))
      .then(challenge => this._saveAttachments(challenge))
      .then(challenge => this._setVersion(challenge))
      // update challenge's version and patch Pix API cache
      .then(challenge => this._saveChallenge(challenge))
      .then(challenge => {
        this.edition = false;
        this.send('minimize');
        this._message('Prototype enregistré');
        this.router.transitionTo('authenticated.competence.prototypes.single', this.currentData.getCompetence(), challenge.id);
      })
      .catch((error) => {
        console.error(error);
        Sentry.captureException(error);
        this._errorMessage('Erreur lors de la création');
      })
      .finally(() => {
        this.loader.stop();
      });
  }

  async _setVersion(challenge) {
    if (!challenge.isWorkbench) {
      const skill = await challenge.skill;
      const version = skill.getNextPrototypeVersion();
      challenge.version = version;
      this._message(this.intl.t('challenge.new.version', { version }), true);
    }
    return challenge;
  }
}

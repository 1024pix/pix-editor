import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import * as Sentry from '@sentry/ember';

import Prototype from './single';

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
  async save() {
    this.loader.start();
    try {
      await this._handleIllustration(this.challenge);
      await this._handleAttachments(this.challenge);
      // create challenge without patching Pix API cache
      await this._saveChallenge(this.challenge);
      await this._saveFiles(this.challenge);
      await this._setVersion(this.challenge);
      // update challenge's version and patch Pix API cache
      await this._saveChallenge(this.challenge);
      this.edition = false;
      this.send('minimize');
      this._message('Prototype enregistré');
      this.router.transitionTo('authenticated.competence.prototypes.single', this.currentData.getCompetence(), this.challenge.id);
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this._errorMessage('Erreur lors de la création');
    } finally {
      this.loader.stop();
    }
  }

  async _setVersion(challenge) {
    const skill = await challenge.skill;
    if (!challenge.isWorkbench) {
      const version = skill.getNextPrototypeVersion();
      challenge.version = version;
      this._message(this.intl.t('challenge.new.version', { version }), true);
    }
    return challenge;
  }
}

import Template from './single';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';
import {inject as service} from '@ember/service';

export default class NewController extends Template {

  creation = true;
  queryParams = ['from', 'fromSkill'];
  @tracked from = '';
  @service currentData;
  @service loader;

  defaultSaveChangelog = 'Création du prototype';

  @action
  cancelEdit() {
    this.store.deleteRecord(this.challenge);
    this.edition = false;
    this._message('Création annulée');
    this.parentController.send('closeChildComponent');
  }

  @action
  save() {
    this.loader.start();
    return this._handleIllustration(this.challenge)
      .then(challenge => this._handleAttachments(challenge))
      .then(challenge => this._saveChallenge(challenge))
      .then(challenge => this._setVersion(challenge))
      .then(challenge => this._handleCache(challenge))
      .then(challenge => {
        this.edition = false;
        this.send('minimize');
        this._message('Prototype enregistré');
        this.transitionToRoute('competence.templates.single', this.currentData.getCompetence(), challenge);
      })
      .catch(() => {
        this._errorMessage('Erreur lors de la création');
      })
      .finally(() => {
        this.loader.stop();
      });
  }

  _setVersion(challenge) {
    let operation;
    if (challenge.isWorkbench) {
      operation = Promise.resolve(challenge);
    } else {
      const firstSkill = challenge.firstSkill;
      if (!firstSkill) {
        operation = Promise.resolve(challenge);
      } else {
        const version = firstSkill.getNextVersion();
        if (version > 0) {
          challenge.version = version;
          operation = challenge.save();
        } else {
          operation = Promise.resolve(challenge);
        }
      }
    }
    return operation.then(challenge => {
      const version = challenge.version;
      if (version > 0) {
        this._message(`Nouvelle version : ${version}`, true);
      }
      return challenge;
    });
  }
}

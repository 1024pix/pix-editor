import classic from 'ember-classic-decorator';
import Template from './single';
import { action } from '@ember/object';

@classic
export default class NewController extends Template {

  creation = true;
  queryParams = ['from'];

  defaultSaveChangelog = 'Création du prototype';

  @action
  cancelEdit() {
    this.get('store').deleteRecord(this.get('challenge'));
    this.set('edition', false);
    this._message('Création annulée');
    this.get('parentController').send('closeChildComponent');
  }

  @action
  save() {
    this.get('application').send('isLoading');
    return this._handleIllustration(this.get('challenge'))
    .then(challenge => this._handleAttachments(challenge))
    .then(challenge => this._saveChallenge(challenge))
    .then(challenge => this._setVersion(challenge))
    .then(challenge => this._handleCache(challenge))
    .then(challenge => {
      this.set('edition', false);
      this.send('minimize');
      this._message('Prototype enregistré');
      this.transitionToRoute('competence.templates.single', this.get('competence'), challenge);
    })
    .catch(() => {
      this._errorMessage('Erreur lors de la création');
    })
    .finally(() => {
      this.get('application').send('finishedLoading');
    })
  }

  _setVersion(challenge) {
    let operation;
    if (challenge.get('isWorkbench')) {
      operation = Promise.resolve(challenge);
    } else {
      const firstSkill = challenge.get('firstSkill');
      if (!firstSkill) {
        operation = Promise.resolve(challenge);
      } else {
        const version = firstSkill.getNextVersion();
        if (version > 0) {
          challenge.set('version', version);
          operation = challenge.save()
        } else {
          operation = Promise.resolve(challenge);
        }
      }
    }
    return operation.then(challenge => {
      let version = challenge.get('version');
      if (version > 0) {
        this._message(`Nouvelle version : ${version}`, true);
      }
      return challenge;
    });
  }
}

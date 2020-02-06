import classic from 'ember-classic-decorator';
import Alternative from './single';
import {action} from '@ember/object';

@classic
export default class NewController extends Alternative {
  creation = true;
  mayUpdateCache = false;
  queryParams = ['from', 'workbench'];
  defaultSaveChangelog = 'Création de la déclinaison';

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
    .then(challenge => this._setAlternativeVersion(challenge))
    .then(challenge => {
      this.set('edition', false);
      this.send('minimize');
      this._message(`Déclinaison numéro ${challenge.get('alternativeVersion')} enregistrée`);
      this.transitionToRoute('competence.templates.single.alternatives.single', this.get('competence'), this.get('template'), challenge);
    })
    .catch((error) => {
      this._errorMessage('Erreur lors de la création');
      console.error(error);
    })
    .finally(() => {
      this.get('application').send('finishedLoading');
    })
  }

  _setAlternativeVersion(challenge) {
    const skill = challenge.get('firstSkill');
    return skill.reload()
    .then(() => this.get('template').getNextAlternativeVersion())
    .then(version => {
      challenge.set('alternativeVersion', version);
      return challenge.save();
    })
  }
}
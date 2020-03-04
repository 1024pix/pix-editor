import Template from '../../single';
import {action} from '@ember/object';
import {scheduleOnce} from '@ember/runloop';
import {inject as controller} from '@ember/controller';
import {alias} from '@ember/object/computed';

export default class SingleController extends Template {

  alternative = true;
  popinImageClass = 'alternative-popin-image';
  popinLogClass = 'popin-alternative-log';
  popinChangelogClass = 'popin-alternative-changelog';
  copyZoneId = 'copyZoneDraft';
  elementClass = 'alternative-challenge';

  @controller('competence.templates.single.alternatives')
  parentController;

  @alias('parentController.secondMaximized')
  maximized;

  defaultSaveChangelog = 'Mise à jour de la déclinaison';

  get challengeTitle() {
    if (this.creation) {
      return 'Nouvelle déclinaison';
    } else {
      let index = this.challenge.alternativeVersion;
      return 'Déclinaison n°'+index;
    }
  }

  _executeCopy() {
    const element = document.getElementById(this.copyZoneId);
    element.select();
    try {
      var successful = document.execCommand('copy');
      if (!successful) {
        this.get('application').send('showMessage', 'Erreur lors de la copie', false);
      } else {
        this.get('application').send('showMessage', 'lien copié', true);
      }
    } catch (err) {
      this.get('application').send('showMessage', 'Erreur lors de la copie', false);
    }
    this.set('copyOperation', false);
  }

  @action
  preview() {
    let challenge = this.challenge;
    window.open(challenge.preview, challenge.id);
  }

  @action
  openAirtable() {
    window.open(this.config.airtableUrl+this.config.tableChallenges+'/'+this.challenge.id, 'airtable');
  }

  @action
  copyLink() {
    this.copyOperation = true;
    scheduleOnce('afterRender', this, this._executeCopy);
  }
}

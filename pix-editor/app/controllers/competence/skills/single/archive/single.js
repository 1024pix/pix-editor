import PrototypeController from '../../../prototypes/single';
import { action } from '@ember/object';
import { scheduleOnce } from '@ember/runloop';
import { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';

export default class SingleController extends PrototypeController {

  popinImageClass = 'archive-popin-image';
  copyZoneId = 'copyZoneArchive';
  elementClass = 'archive-challenge';

  @controller('competence.skills.single.archive')
  parentController;

  @alias('parentController.rightMaximized')
  maximized;

  get challengeTitle() {
    if (this.creation) {
      return 'Nouvelle déclinaison';
    } else {
      const index = this.challenge.alternativeVersion;
      return 'Déclinaison n°' + index;
    }
  }

  _executeCopy() {
    const element = document.getElementById(this.copyZoneId);
    element.select();
    try {
      var successful = document.execCommand('copy');
      if (!successful) {
        this.notify.error('Erreur lors de la copie');
      } else {
        this.notify.message('lien copié');
      }
    } catch (err) {
      this.notify.error('Erreur lors de la copie');
    }
    this.set('copyOperation', false);
  }

  @action
  preview() {
    const challenge = this.challenge;
    window.open(challenge.preview, challenge.id);
  }

  @action
  openAirtable() {
    window.open(this.config.airtableUrl + this.config.tableChallenges + '/' + this.challenge.id, 'airtable');
  }

  @action
  copyLink() {
    this.copyOperation = true;
    scheduleOnce('afterRender', this, this._executeCopy);
  }

  @action
  maximize() {
    this.parentController.maximizeRight(true);
  }

  @action
  minimize() {
    this.parentController.maximizeRight(false);
  }

}


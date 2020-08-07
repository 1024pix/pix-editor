import PrototypeController from '../../single';
import { action } from '@ember/object';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';

export default class SingleController extends PrototypeController {

  alternative = true;
  popinImageClass = 'alternative-popin-image';
  popinLogClass = 'popin-alternative-log';
  popinChangelogClass = 'popin-alternative-changelog';
  elementClass = 'alternative-challenge';

  @controller('competence.prototypes.single.alternatives')
  parentController;

  @alias('parentController.rightMaximized')
  maximized;

  @service notify;

  defaultSaveChangelog = 'Mise à jour de la déclinaison';

  get challengeTitle() {
    if (this.creation) {
      return 'Nouvelle déclinaison';
    } else {
      const index = this.challenge.alternativeVersion;
      return 'Déclinaison n°' + index;
    }
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

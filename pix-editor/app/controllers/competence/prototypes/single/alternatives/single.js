import PrototypeController from '../../single';
import { action } from '@ember/object';
import { inject as controller } from '@ember/controller';
import { alias } from '@ember/object/computed';

export default class SingleController extends PrototypeController {

  elementClass = 'alternative-challenge';

  @controller('competence.prototypes.single.alternatives')
  parentController;

  @alias('parentController.rightMaximized')
  maximized;

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

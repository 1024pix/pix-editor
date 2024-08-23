import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

import PrototypeController from '../../single';

export default class SingleController extends PrototypeController {

  elementClass = 'alternative-challenge';

  @controller('authenticated.competence.prototypes.single.alternatives')
    parentController;

  get maximized() {
    return this.parentController.rightMaximized;
  }

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

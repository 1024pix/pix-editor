import { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

import PrototypeController from '../../../prototypes/single';

export default class SingleController extends PrototypeController {

  elementClass = 'archive-challenge';

  @controller('authenticated.competence.skills.single.archive')
    parentController;

  get maximized() {
    return this.parentController.rightMaximized;
  }

  mayValidate = false;
  mayMove = false;
  mayEdit = false;
  mayDuplicate = false;
  mayAccessAlternatives = false;

  get challengeTitle() {
    if (this.challenge.isPrototype) {
      return 'Prototype n°' + this.challenge.version;
    } else {
      return `Version n°${this.challenge.version} - Déclinaison n°${this.challenge.alternativeVersion}`;
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


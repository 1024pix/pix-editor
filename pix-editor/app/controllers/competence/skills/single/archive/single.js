import PrototypeController from '../../../prototypes/single';
import { action } from '@ember/object';
import { inject as controller } from '@ember/controller';

export default class SingleController extends PrototypeController {

  elementClass = 'archive-challenge';

  @controller('competence.skills.single.archive')
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


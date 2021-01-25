import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';

export default class CompetenceHistorySingleController extends Controller {

  @controller('competence')
  parentController;

  get isMaximized() {
    return this.parentController.leftMaximized;
  }

  get firstSkill() {
    return this.model[0];
  }

  @action
  maximize() {
    this.parentController.maximizeLeft(true);
  }

  @action
  minimize() {
    this.parentController.maximizeLeft(false);
  }

  @action
  close() {
    this.parentController.send('closeChildComponent');
  }

}

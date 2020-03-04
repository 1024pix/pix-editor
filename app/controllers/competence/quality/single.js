import Skill from '../skills/single';
import { action } from '@ember/object';

export default class SingleController extends Skill {
  @action
  close() {
    this.maximized = false;
    this.transitionToRoute('competence.quality', this.competence);
  }
}

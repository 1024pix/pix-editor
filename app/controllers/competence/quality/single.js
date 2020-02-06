import classic from 'ember-classic-decorator';
import { action } from '@ember/object';
import Skill from '../skills/single';

@classic
export default class SingleController extends Skill {
  @action
  close() {
    this.set("maximized", false);
    this.transitionToRoute('competence.quality', this.get('competence'));
  }
}

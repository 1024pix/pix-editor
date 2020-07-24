import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class SkillHistory extends SortedList {

  @service router;

  headers = [{
    name:'Nom',
    valuePath:'name',
  },{
    name:'Statut',
    valuePath:'status',
    maxWidth:200,
  }];

  @action
  selectRow(skill) {
     this.router.transitionTo('competence.skills.single', skill);
  }
}

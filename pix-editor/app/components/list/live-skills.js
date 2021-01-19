import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ListLiveSkillsComponent extends SortedList {

  @service router;

  headers = [{
    name:'Identifiant',
    valuePath:'pixId',
  },{
    name:'Date de création',
    valuePath:'date'
  },{
    name:'Epreuves',
    valuePath:'challenges.length',
    maxWidth:200
  },{
    name:'Statut',
    valuePath:'status',
    maxWidth:200,
    style:true
  }];

  @action
  selectRow(skill) {
    this.router.transitionTo('competence.skills.single', skill);
  }
}

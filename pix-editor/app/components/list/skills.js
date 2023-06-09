import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ListSkillsComponent extends SortedList {

  @service router;

  headers = [{
    name:'Version',
    valuePath:'version',
    maxWidth:100
  },{
    name:'Description',
    valuePath:'description'
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
    this.router.transitionTo('authenticated.competence.skills.single', skill);
  }
}

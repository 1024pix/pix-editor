import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AlternativesList extends SortedList {

  @service router;

  headers = [{
    name:'Indice',
    valuePath:'alternativeVersion',
    maxWidth:150,
  },{
    name:'Consigne',
    valuePath:'instructions',
  },{
    name:'Auteur',
    valuePath:'author',
    maxWidth:150,
  },{
    name:'Statut',
    valuePath:'status',
    maxWidth:150,
    style:true
  }];

  @action
  selectRow(row) {
    this.router.transitionTo('competence.templates.single.alternatives.single', row);
  }

}

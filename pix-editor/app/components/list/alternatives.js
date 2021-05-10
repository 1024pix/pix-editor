import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AlternativesList extends SortedList {

  @service router;

  headers = [{
    name:'Indice',
    valuePath:'alternativeVersion',
    maxWidth:50,
  },{
    name:'Consigne',
    valuePath:'instruction',
  },{
    name:'Langue(s)',
    valuePath:'locales',
    maxWidth:80,
    minWidth:75,
    languages:true
  },{
    name:'Auteur',
    valuePath:'author',
    maxWidth:80,
  },{
    name:'Statut',
    valuePath:'status',
    maxWidth:130,
    style:true
  }];

  @action
  selectRow(row) {
    this.router.transitionTo('competence.prototypes.single.alternatives.single', row);
  }

}

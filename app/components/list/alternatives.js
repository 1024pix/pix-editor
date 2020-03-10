import SortedList from './competences';
import { action } from '@ember/object';

export default class AlternativesList extends SortedList {

  listType = 'alternative-list';

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

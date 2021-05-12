import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class PrototypesList extends SortedList {

  @service router;

  headers = [{
    name:'Version',
    valuePath:'version',
    maxWidth:150,
  },{
    name:'Consigne',
    valuePath:'instruction',
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

  sortTypes = {
    'Version':'string',
    'instruction':'string',
    'type':'string',
    'status':'string'
  }

  @action
  selectRow(row) {
    this.router.transitionTo('competence.prototypes.single', row);
  }

}

import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class ArchiveList extends SortedList {

  @service router;

  list = [{ instruction:'coucou' }];

  headers = [{
    name:'Version',
    valuePath:'version',
    maxWidth:80,
  },{
    name:'Prototype',
    valuePath:'isPrototype',
    maxWidth:80,
    yesno:true
  },
  {
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
    maxWidth:100,
  },{
    name:'Statut',
    valuePath:'status',
    maxWidth:100,
    style:true
  }];

  @action
  selectRow(row) {
    this.router.transitionTo('competence.skills.single.archive.single', row);
  }

}

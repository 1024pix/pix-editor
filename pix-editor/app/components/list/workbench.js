import { action } from '@ember/object';
import SortedList from './sorted';
import { inject as service } from '@ember/service';

export default class CompetencesList extends SortedList {

  @service router;
  @service currentData;

  headers = [{
    name:'Auteur',
    valuePath:'authorText',
    maxWidth:150
  },{
    name:'Consigne',
    valuePath:'instruction',
  },{
    name:'Type',
    valuePath:'type',
    maxWidth:150
  },{
    name:'Statut',
    valuePath:'status',
    maxWidth:150,
    style:true
  }];

  sortTypes = {
    'authorText':'string',
    'instruction':'string',
    'type':'string',
    'status':'string'
  };

  @action
  selectRow(row) {
    this.router.transitionTo(this.args.link, this.args.competenceModel, row);
  }

  get current() {
    return this.currentData.getPrototype();
  }

}

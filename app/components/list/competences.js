import { action } from '@ember/object';
import SortedList from './sorted';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CompetencesList extends SortedList {
  listType = 'template-list';
  @service router;
  @service currentData;

  @tracked sorts = [];

  headers = [{
    name:'Auteur',
    valuePath:'authorText',
    className:'authorText',
    maxWidth:150
  },{
    name:'Consigne',
    valuePath:'instructions',
    className:'instructions'
  },{
    name:'Type',
    valuePath:'type',
    className:'type',
    maxWidth:150
  },{
    name:'Statut',
    valuePath:'status',
    className:'status',
    maxWidth:150
  }];

  sortTypes = {
    'authorText':'string',
    'instructions':'string',
    'type':'string',
    'status':'string'
  }

  @action
  selectRow(row) {
    this.router.transitionTo(this.args.link, this.args.competenceModel, row);
  }

  get current(){
    return this.currentData.getTemplate();
  }

  @action
  testSort(params) {
    if (params.length > 0) {
      const field = params[0].valuePath;
      this.sortField = field;
      this.ascending = params[0].isAscending;
      this.sorts = params;
    } else {
      this.ascending = !this.ascending;
      this.sorts = [{
        valuePath:this.sortField,
        isAscending:this.ascending
      }]
    }
  }
}

import CompetenceList from './competences';
import { action } from '@ember/object';

export default class TemplatesList extends CompetenceList {
  listType = 'template-list';

  headers = [{
    name:'Version',
    valuePath:'version',
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

  sortTypes = {
    'Version':'string',
    'instructions':'string',
    'type':'string',
    'status':'string'
  }

  @action
  selectRow(row) {
    this.router.transitionTo('competence.templates.single', row);
  }

}
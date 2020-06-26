import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class I18n extends SortedList {

  @service router;

  headers = [{
    name:'Consigne',
    valuePath:'challenge.instructions',
  },{
    name:'Langue',
    valuePath:'language',
    maxWidth:200,
    language:true
  },{
    name:'Déclinaisons',
    valuePath:'language',
    maxWidth:150,
    alternatives:true
  }];

  @action
  selectRow() {
    const productionTemplate = this.args.skill.productionTemplate
    this.router.transitionTo('competence.templates.single.alternatives', productionTemplate);
  }
}

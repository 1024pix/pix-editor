import SortedList from './sorted';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class I18n extends SortedList {

  @service router;

  headers = [{
    name:'Consigne',
    valuePath:'challenge.instruction',
  },{
    name:'Langue',
    valuePath:'language',
    maxWidth:200,
    language:true
  },{
    name:'Déclinaisons',
    valuePath:'alternativesCount',
    maxWidth:150,
    alternatives:true
  }];

  @action
  selectRow() {
    const productionPrototype = this.args.skill.productionPrototype;
    this.router.transitionTo('authenticated.competence.prototypes.single.alternatives', productionPrototype);
  }
}

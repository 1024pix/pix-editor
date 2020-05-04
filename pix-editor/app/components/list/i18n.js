import SortedList from './sorted';

export default class I18n extends SortedList {

  headers = [{
    name:'Consigne',
    valuePath:'instructions',
  },{
    name:'Langues',
    valuePath:'languages',
    maxWidth:300,
    languages:true
  },{
    name:'Déclinaisons',
    valuePath:'alternatives',
    maxWidth:150,
    alternatives:true
  }];
}

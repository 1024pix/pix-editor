import SortedList from './sorted';
import { action } from '@ember/object';

export default class EventsLogList extends SortedList {

  headers = [{
    name: 'Acquis',
    valuePath: 'recordId',
    maxWidth: 200,
    skill: true
  },{
    name: 'Description',
    valuePath: 'text',
  }, {
    name: 'Auteur',
    valuePath: 'author',
    maxWidth: 100,
  }, {
    name: 'Date',
    valuePath: 'date',
    maxWidth: 150,
  }];

  @action
  selectRow(item) {
    console.log(item);
  }
}

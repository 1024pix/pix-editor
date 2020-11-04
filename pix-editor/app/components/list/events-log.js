import SortedList from './sorted';

export default class EventsLogList extends SortedList {

  headers = [{
    name: 'Acquis',
    valuePath: 'skillName',
    maxWidth: 150,
    skill: true
  },{
    name: 'Description',
    valuePath: 'text',
  },{
    name: 'Date',
    valuePath: 'date',
    maxWidth: 100,
  }, {
    name: 'Auteur',
    valuePath: 'author',
    maxWidth: 100,
  }, {
    name: 'Action',
    valuePath: 'action',
    maxWidth: 150,
  }];
}

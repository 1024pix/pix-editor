import classic from 'ember-classic-decorator';
import SortedList from './sorted-list';

@classic
export default class NoteList extends SortedList {
  displayAuthor = true;
  displayStatus = true;
}

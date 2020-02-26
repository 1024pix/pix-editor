import SortedList from './sorted-list';

export default class NoteList extends SortedList {

  get displayAuthor() {
    if (typeof this.args.displayAuthor !== 'undefined') {
      return this.args.displayAuthor;
    }
    return true;
  }

  get displayStatus() {
    if (typeof this.args.displayStatus !== 'undefined') {
      return this.args.displayStatus;
    }
    return true;
  }
}

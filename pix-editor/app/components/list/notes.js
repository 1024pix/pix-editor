import { action } from '@ember/object';

import SortedList from './sorted';

export default class NoteList extends SortedList {
  @action
  selectRow(row) {
    this.args.show(row);
  }

  get list() {
    return Array.isArray(this.args.list) ? this.args.list : [];
  }

  get displayAuthor() {
    return this.args.displayAuthor ?? true;
  }

  get displayStatus() {
    return this.args.displayStatus ?? true;
  }
}

import SortedList from './sorted';
import { action } from '@ember/object';

export default class NoteList extends SortedList {

  get headers() {
     let headers = [{
      name:'Date',
      valuePath:'date',
      maxWidth:150,
    }];
    if (this.displayAuthor) {
      headers.push({
        name:'Auteur',
        valuePath:'author',
        maxWidth:150,
      });
    }
    headers.push({
      name:'Texte',
      valuePath:'text',
    });
    if (this.displayStatus) {
      headers.push({
        name:'Statut',
        valuePath:'status',
        maxWidth:150,
      });
    }
    return headers;
  }

  @action
  selectRow(row) {
    this.args.show(row);
  }

  get sortedList() {
    if (Array.isArray(this.args.list)) {
      return this.args.list;
    } else {
      return [];
    }
  }

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
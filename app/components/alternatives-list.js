import SortedList from './sorted-list';

export default class AlternativesList extends SortedList {
  listType = 'alternative-list';

  get hiddenClass() {
    return this.args.hidden?' hidden ':'';
  }

}

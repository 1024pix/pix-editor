import SortedList from './sorted';

export default class AlternativesList extends SortedList {
  listType = 'alternative-list';

  get hiddenClass() {
    return this.args.hidden?' hidden ':'';
  }

}

import { action } from '@ember/object';
import SortedList from './sorted';

export default class CompetencesList extends SortedList {
  listType = 'template-list';
  scrollLeft = 0;
  currentCount = 0;
  scrollValue = 0;

  get scrollTop() {
    let count = this.args.itemCount;
    if (count !== this.currentCount) {
      this.currentCount = count;
      return 0;
    }
    return this.scrollValue;
  }

  set scrollTop(value) {
    this.scrollValue = value;
    return value;
  }

  @action
  scrollChange(scrollLeft, scrollTop) {
    this.scrollLeft = scrollLeft;
    this.scrollTop = scrollTop;
  }
}

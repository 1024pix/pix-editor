import classic from 'ember-classic-decorator';
import { classNameBindings } from '@ember-decorators/component';
import { action, computed } from '@ember/object';
import SortedList from '../sorted-list';

@classic
@classNameBindings("hidden", "listType")
export default class CompetenceList extends SortedList {
  listType = "template-list";
  scrollLeft = 0;

  init() {
    super.init();
    this.currentCount = 0;
  }

  @computed('itemCount')
  get scrollTop() {
    let count = this.get('itemCount');
    if (count !== this.currentCount) {
      this.currentCount = count;
      return 0;
    }
    return this.get('scrollValue');
  }

  set scrollTop(value) {
    this.set('scrollValue', value);
    return value;
  }

  @action
  scrollChange(scrollLeft, scrollTop) {
    this.set('scrollLeft', scrollLeft);
    this.set('scrollTop', scrollTop);
  }
}

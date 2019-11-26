import SortedList from '../sorted-list';
import {computed} from '@ember/object';

export default SortedList.extend({
  classNameBindings: ["hidden", "listType"],
  listType: "template-list",
  scrollLeft:0,
  init() {
    this._super();
    this.currentCount = 0;
  },
  scrollTop:computed('itemCount', {
    get() {
      let count = this.get('itemCount');
      if (count !== this.currentCount) {
        this.currentCount = count;
        return 0;
      }
      return this.get('scrollValue');
    },
    set(key, value) {
      this.set('scrollValue', value);
      return value;
    }
  }),
  actions: {
    scrollChange(scrollLeft, scrollTop) {
      this.set('scrollLeft', scrollLeft);
      this.set('scrollTop', scrollTop);
    }
  }
});

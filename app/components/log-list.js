import SortedList from './sorted-list';
import {computed} from '@ember/object';

export default SortedList.extend({
  classNameBindings: ["listType"],
  listType: "template-list",
  scrollLeft:0,
  init() {
    this._super();
    this.currentCount = 10;
  },
  scrollTop:computed('itemCount', {
    get() {
      let count = 10;
      // if (count !== this.gcurrentCount) {
      //   this.currentCount = count;
      //   return 0;
      // }
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

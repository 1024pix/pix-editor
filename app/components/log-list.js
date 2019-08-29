import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  classNameBindings: ["listType"],
  listType: "template-list",
  scrollLeft:0,
  pageSize: 5,
  init() {
    this._super();
    this.currentCount = 10;
    this.columns =[100];;
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
    },
    fetch(pageOffset, pageSize, stats) {
      // function which returns a "thenable" (*required*)
      let params = {
        query: query
      };
      // fetch a page of records at the pageOffset
      return this.store.query("record", params).then(data => {
        let meta = data.get("meta");
        stats.totalPages = meta.totalPages;
        return data.toArray();
      });
    }
  }
});

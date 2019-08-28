import Component from '@ember/component';
import $ from "jquery";
import {computed} from '@ember/object';
import DS from 'ember-data';

export default Component.extend({
  classNameBindings: ["listType"],
  listType: "sorted-list",
  list:null,
  sortField:null,
  sortType:null,
  ascending:true,
  sortElements:function(elements) {
    let field = this.get('sortField');
    let type = this.get('sortType');
    let sort1, sort2;
    if (this.get('ascending')) {
      sort1 = -1;
      sort2 = 1;
    } else {
      sort1 = 1;
      sort2 = -1;
    }
    if (type === "array") {
      elements.sort((a,b) => {
        let val1 = a.get(field);
        let val2 = b.get(field);
        if (val1 && val1.length>0) {
          val1 = val1[0];
        } else {
          val1 = "";
        }
        if (val2 && val2.length>0) {
          val2 = val2[0];
        } else {
          val2 = "";
        }
        if (val1>val2)
          return sort1;
        if (val1<val2)
          return sort2;
        return 0;
      })
    } else if (type === "string") {
      elements.sort((a,b) => {
        let val1 = a.get(field), val2 = b.get(field);
        if (val1) {
          val1 = val1.toLowerCase();
        } else {
          val1 = "";
        }
        if (val2) {
          val2 = val2.toLowerCase();
        } else {
          val2 = "";
        }
        if (val1>val2) {
          return sort1;
        }
        if (val1<val2) {
          return sort2;
        }
        return 0;
      })
    } else {
      elements.sort((a,b) => {
        let val1 = a.get(field), val2 = b.get(field);
        if (val1) {
          val1 = parseInt(val1);
        } else {
          val1 = 0;
        }
        if (val2) {
          val2 = parseInt(val2);
        } else {
          val2 = 0;
        }
        if (val1>val2) {
          return sort1;
        }
        if (val1<val2) {
          return sort2;
        }
        return 0;
      });
    }
    return elements;
  },
  sortedList: computed('list', 'sortField', 'ascending', function() {
    let field = this.get('sortField');
    if (field) {
      let list = this.get('list');
      if (Array.isArray(list)) {
        return this.sortElements(list);
      } else {
        return DS.PromiseArray.create({
          promise: this.get("list")
          .then(list => {
            return this.sortElements(list.toArray());
          })
        });
      }
    } else {
      return this.get('list');
    }
  }),
  init() {
    this._super(...arguments);
    this.columns = [100];
  },
  actions:{
    sortBy(field, type) {
      if (field === this.get('sortField')) {
        this.set('ascending', !this.get('ascending'));
      } else {
        this.set('sortField', field);
        this.set('ascending', true);
      }
      this.set('sortType', type);
      let className = this.get("listType");
      $(`.${className} .list-header .list-sorted`).removeClass('sorting');
      let sortElement = $(`.${className} .list-header .list-sorted.${field}`);
      sortElement.addClass('sorting');
      if (this.get('ascending')) {
        sortElement.removeClass("descending");
        sortElement.addClass("ascending");
      } else {
        sortElement.removeClass("ascending");
        sortElement.addClass("descending");
      }
    }
  }
});

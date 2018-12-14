import Component from '@ember/component';
import {observer} from "@ember/object";
import $ from "jquery";

export default Component.extend({
  classNameBindings: ["listType"],
  listType: "sorted-list",
  init() {
    this._super(...arguments);
    this.columns = [100];
  },
  // eslint-disable-next-line ember/no-observers
  sortManager:observer("list", function() {
    $("."+this.get("listType")+" .list-header .list-item").removeClass("sorting");
  }),
  actions:{
    sortBy(field, type) {
      let className = this.get("listType");
      let sort1, sort2;
      let sortElement = $("."+className+" .list-header .list-item."+field);
      if (sortElement.hasClass("ascending")) {
        sortElement.removeClass("ascending");
        sortElement.addClass("descending");
        sort1 = -1;
        sort2 = 1;
      } else {
        sortElement.removeClass("descending");
        sortElement.addClass("ascending");
        sort1 = 1;
        sort2 = -1;
      }
      let list = this.get("list");
      let elements = list.toArray();
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
          if (val1>val2)
            return sort1;
          if (val1<val2)
            return sort2;
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
          if (val1>val2)
            return sort1;
          if (val1<val2)
            return sort2;
          return 0;
        });
      }
      list.clear();
      list.pushObjects(elements);
      this.set("list", list);
      $("."+className+" .list-header .list-item").removeClass("sorting");
      sortElement.addClass("sorting");
    }
  }
});

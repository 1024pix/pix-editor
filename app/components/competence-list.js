import Component from '@ember/component';
import {observer} from "@ember/object";
import $ from "jquery";

export default Component.extend({
  classNames:["competence-list"],
  classNameBindings: ["hidden"],
  init() {
    this._super(...arguments);
    this.columns = [100];
  },
  sortManager:observer("list", function() {
    $(".competence-list-header .list-item").removeClass("sorting");
  }),
  actions:{
    sortBy(field) {
      let sort1, sort2;
      let sortElement = $(".competence-list-header .list-item."+field);
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
      if (field === "skillNames") {
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
      } else {
        elements.sort((a,b) => {
          let val1 = a.get(field), val2 = b.get(field);
          if (val1>val2)
            return sort1;
          if (val1<val2)
            return sort2;
          return 0;
        })
      }
      list.clear();
      list.pushObjects(elements);
      this.set("list", list);
      $(".competence-list-header .list-item").removeClass("sorting");
      sortElement.addClass("sorting");
    }
  }
});

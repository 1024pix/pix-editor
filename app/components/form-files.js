import Component from '@ember/component';

export default Component.extend({
  classNames:['field'],
  actions: {
    remove(index) {
      // clone instead of removeAt, so that rollbackAttributes
      // may work
      let list = this.get("value").slice();
      list.splice(index, 1);
      this.set("value", list);
    },
    add(file) {
      let value = this.get("value");
      let list = value?value.slice():[];
      list.unshift({file:file, url:"", filename:file.get("name")});
      this.set("value", list);
    }
  }
});

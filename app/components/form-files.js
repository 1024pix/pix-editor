import Component from '@ember/component';
import { inject as service } from '@ember/service';

export default Component.extend({
  classNames:['field'],
  filePath:service(),
  actions: {
    remove(index) {
      // clone instead of removeAt, so that rollbackAttributes
      // may work
      let list = this.get("value").slice();
      list.splice(index, 1);
      this.set("value", list);
    },
    add(file) {
      const value = this.get('value');
      let list = value?value.slice():[];
      list.unshift({file:file, url:'', filename:file.get('name')});
      this.set('value', list);
      if (this.get('baseName') == null) {
        this.set('baseName', this.get('filePath').getBaseName(file.get('name')));
      }
    }
  }
});

import Component from '@ember/component';

export default Component.extend({
  classNames:['field'],
    actions:{
      remove() {
        this.set("value", []);
      },
      add(file) {
        this.set("value", [{file:file}]);
      }
    }
});

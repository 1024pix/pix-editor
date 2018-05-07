import Component from '@ember/component';

export default Component.extend({
  tagName:"",
  init() {
    this._super(...arguments);
    this.options = {
      status:["en cours", "terminé", "archive"]
    };
  },
  actions:{
    save() {
      let entry = this.get("entry");
      if (!entry.get("id")) {
        entry.set("createdAt", (new Date()).toISOString());
      }
      //TODO: show loading
      entry.save()
      .then(this.get("update")());
    }
  }
});

import Component from '@ember/component';

export default Component.extend({
  value:"",
  actions:{
    confirm() {
      this.get("approve")(this.get("value"));
    }
  }
});

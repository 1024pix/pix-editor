import PopinBase from "./popin-base";

export default PopinBase.extend({
  value:"",
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  },
  actions:{
    confirm() {
      this.get("approve")(this.get("value"));
    }
  }
});

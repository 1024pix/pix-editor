import PopinBase from "./popin-base";


export default PopinBase.extend({
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  }

});

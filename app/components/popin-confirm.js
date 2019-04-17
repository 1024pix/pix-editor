import PopinBase from "./popin-base";

export default PopinBase.extend({
  classNames:['mini'],
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  }
});

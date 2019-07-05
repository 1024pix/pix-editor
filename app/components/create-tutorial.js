import PopinBase from "./popin-base";


export default PopinBase.extend({

  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  },
  actions: {

    approveModal: function(element, component) {
      alert('approve ' + component.get('name'));
      return false;
    },

    denyModal: function(element, component) {
      alert('deny ' + component.get('name'));
      return true;
    }
  }
});

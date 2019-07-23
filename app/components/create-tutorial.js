import PopinBase from "./popin-base";


export default PopinBase.extend({
  isCrush:false,
  willInitSemantic(settings) {
    this._super(...arguments);
    settings.closable = false;
  },
  actions: {
    saveTutorial(){
      console.log('saveTuto')
    },
    toCrush(){
     let isCrush = !this.get('isCrush');
      this.set('isCrush', isCrush);
    }

  }
});

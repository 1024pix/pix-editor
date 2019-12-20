import PopinBase from './popin-base';

export default PopinBase.extend({
  actions:{
    validate() {
     this.set('display', false);
      this.get('setValue')(this.get('value'));
    },
    closeModal(){
      this.set('display', false);
    }
  }
});

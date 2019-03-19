import PopinBase from './popin-base';

export default PopinBase.extend({
  actions:{
    validate() {
      this.execute('hide');
      this.get('setValue')(this.get('value'));
    }
  }
});

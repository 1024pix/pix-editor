import Component from '@ember/component';

export default Component.extend({
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

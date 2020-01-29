import Component from '@ember/component';

export default Component.extend({
  classNames:['small'],
  actions:{
    closeModal(){
      this.set('display', false)
    }
  }
});

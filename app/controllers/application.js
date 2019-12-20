import Controller from '@ember/controller';
import {inject as service} from '@ember/service';

export default Controller.extend({
  loading:false,
  loadingMessage:"",
  displayConfig:false,
  popinImageSrc:"",
  displayChangelog:false,
  confirmTitle:"",
  confirmContent:"",
  confirmCallback:null,
  displayConfiguration:false,
  displayConfirm:false,
  config:service(),
  init() {
    this._super(...arguments);
    this.messages = [];
  },
  actions: {
    showMessage(content, positive) {
      const messages = this.get("messages");
      const id = "message_"+Date.now();
      messages.pushObject({text:content, positive:positive?true:false, id:id});
      window.setTimeout(()=> {
        const nodeMessage = document.getElementById(id);
        if(nodeMessage){
          nodeMessage.addEventListener('transitionend', ()=>{
            messages.removeAt(0);
          });
          nodeMessage.style.transition = 'opacity .8s ease';
          nodeMessage.style.opacity = '0';
        }
      }, 3000);
    },
    isLoading(message) {
      this.set("loading", true);
      this.set("loadingMessage", message);
    },
    finishedLoading() {
      this.set("loading", false);
      this.set("loadingMessage", "");
    },
    openConfiguration() {
      this.set('displayConfiguration', true)
    },
    configUpdated() {
      this.send("refresh");
    },
    confirm(title, message, callback) {
      this.confirmCallback = callback;
      this.set("confirmTitle", title);
      this.set("confirmContent", message);
      this.set('displayConfirm', true);
    },
    confirmApprove() {
      if (this.confirmCallback) {
        this.confirmCallback(true);
      }
      this.set('displayConfirm', false)
    },
    confirmDeny() {
      if (this.confirmCallback) {
        this.confirmCallback(false);
      }
      this.set('displayConfirm', false)
    }
  }
});

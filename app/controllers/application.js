import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';


@classic
export default class ApplicationController extends Controller {
  loading = false;
  loadingMessage = "";
  displayConfig = false;
  popinImageSrc = "";
  displayChangelog = false;
  confirmTitle = "";
  confirmContent = "";
  confirmCallback = null;
  displayConfiguration = false;
  displayConfirm = false;
  _menuOpen = false;

  @service
  config;

  @service
  router;


  init() {
    super.init(...arguments);
    this.messages = [];
  }

  @computed('router.currentRouteName', '_menuOpen')
  get menuOpen() {
    if (this.get('router.currentRouteName') === 'index') {
      return true;
    } else {
      return this.get('_menuOpen');
    }
  }

  @computed('displayConfiguration')
  get lockedMenu() {
    return this.get('displayConfiguration');
  }

  @action
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
  }

  @action
  isLoading(message) {
    this.set("loading", true);
    this.set("loadingMessage", message);
  }

  @action
  finishedLoading() {
    this.set("loading", false);
    this.set("loadingMessage", "");
  }

  @action
  openConfiguration() {
    this.set('displayConfiguration', true)
  }

  @action
  configUpdated() {
    this.send("refresh");
  }

  @action
  confirm(title, message, callback) {
    this.confirmCallback = callback;
    this.set("confirmTitle", title);
    this.set("confirmContent", message);
    this.set('displayConfirm', true);
  }

  @action
  confirmApprove() {
    if (this.confirmCallback) {
      this.confirmCallback(true);
    }
    this.set('displayConfirm', false)
  }

  @action
  confirmDeny() {
    if (this.confirmCallback) {
      this.confirmCallback(false);
    }
    this.set('displayConfirm', false)
  }

}

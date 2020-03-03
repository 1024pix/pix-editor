import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { A } from '@ember/array';
import { tracked } from '@glimmer/tracking';


export default class ApplicationController extends Controller {

  displayConfig = false;
  displayChangelog = false;
  popinImageSrc = '';
  confirmCallback = null;

  @tracked confirmTitle = '';
  @tracked confirmContent = '';
  @tracked displayConfirm = false;
  @tracked loading = false;
  @tracked loadingMessage = '';
  @tracked _menuOpen = false;
  @tracked displayConfiguration = false;

  @service config;
  @service router;

  messages = A([]);

  get menuOpen() {
    if (this.router.currentRouteName === 'index' || this.lockedMenu) {
      return true;
    } else {
      return this._menuOpen;
    }
  }

  get lockedMenu() {
    return this.displayConfiguration;
  }

  get isIndex() {
    return (this.router.currentRouteName === 'index');
  }

  @action
  showMessage(content, positive) {
    const messages = this.messages;
    const id = 'message_'+Date.now();
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
    this.loading = true;
    this.loadingMessage = message;
  }

  @action
  finishedLoading() {
    this.loading = false;
    this.loadingMessage = '';
  }

  @action
  openConfiguration() {
    this.displayConfiguration = true;
  }

  @action
  configUpdated() {
    window.location.reload(true);
  }

  @action
  confirm(title, message, callback) {
    this.confirmCallback = callback;
    this.confirmTitle = title;
    this.confirmContent = message;
    this.displayConfirm = true;
  }

  @action
  confirmApprove() {
    this.displayConfirm =  false;
    if (this.confirmCallback) {
      this.confirmCallback(true);
    }
  }

  @action
  confirmDeny() {
    this.displayConfirm = false;
    if (this.confirmCallback) {
      this.confirmCallback(false);
    }
  }

  @action
  closeConfiguration() {
    this.displayConfiguration = false;
  }

}

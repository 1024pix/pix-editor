import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
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
  @tracked displayLoginForm = false;
  @tracked displayLogout = false;

  @service config;
  @service router;
  @service notify;
  @service loader;
  @service confirm;
  @service store;
  @service window;

  messages = A([]);

  constructor() {
    super(...arguments);
    this.notify.setTarget(this);
    this.loader.setTarget(this);
    this.confirm.setTarget(this);
  }

  get menuOpen() {
    if (this.router.currentRouteName === 'authenticated' || this.lockedMenu) {
      return true;
    } else {
      return this._menuOpen;
    }
  }

  get lockedMenu() {
    return this.displayLoginForm;
  }

  get isIndex() {
    return (this.router.currentRouteName === 'authenticated');
  }

  showMessage(content, positive) {
    const messages = this.messages;
    const id = 'message_' + Date.now();
    messages.pushObject({ text:content, positive:positive ? true : false, id:id });
    window.setTimeout(()=> {
      const nodeMessage = document.getElementById(id);
      if (nodeMessage) {
        nodeMessage.addEventListener('transitionend', ()=>{
          messages.removeAt(0);
        });
        nodeMessage.style.transition = 'opacity .8s ease';
        nodeMessage.style.opacity = '0';
      }
    }, 3000);
  }

  isLoading(message) {
    this.loading = true;
    this.loadingMessage = message;
  }

  finishedLoading() {
    this.loading = false;
    this.loadingMessage = '';
  }

  @action
  openLoginForm() {
    this.displayLoginForm = true;
  }

  @action
  closeLoginForm() {
    this.displayLoginForm = false;
  }

  @action
  openLogout() {
    this.displayLogout = true;
  }

  @action
  closeLogout() {
    this.displayLogout = false;
  }

  @action
  configUpdated() {
    this.window.reload();
  }

  confirmAsk(title, message, callback) {
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
  toggleMenu() {
    this._menuOpen = !this._menuOpen;
  }

  @action
  closeMenu() {
    if (this._menuOpen) {
      this._menuOpen = false;
    }
  }
}

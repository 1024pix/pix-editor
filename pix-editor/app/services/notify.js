import Service from '@ember/service';

export default class NotifyService extends Service {
  target = null;

  setTarget(aTarget) {
    this.target = aTarget;
  }

  message(text) {
    this.target.showMessage(text, true);
  }

  error(text) {
    this.target.showMessage(text, false);
  }

}

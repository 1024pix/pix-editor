import Service from '@ember/service';

export default class ConfirmService extends Service {
  target = null;

  setTarget(aTarget) {
    this.target = aTarget;
  }

  ask(title, text, parameter) {
    return new Promise((resolve, reject) => {
      this.target.confirmAsk(title, text, (result) => {
        if (result) {
          resolve(parameter);
        } else {
          reject(new Error('Operation was canceled by user'));
        }
      });
    });
  }
}

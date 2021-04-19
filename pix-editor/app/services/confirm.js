import Service from '@ember/service';
import { inject as service } from '@ember/service';


export default class ConfirmService extends Service {
  target = null;

  @service loader;

  setTarget(aTarget) {
    this.target = aTarget;
  }

  async ask(title, text, parameter) {
    const wasLoading = this.loader.isLoading;
    if (wasLoading) {
      this.loader.stop();
    }
    await new Promise((resolve, reject) => {
      this.target.confirmAsk(title, text, (result) => {
        if (result) {
          resolve(parameter);
        } else {
          reject(new Error('Operation was canceled by user'));
        }
      });
    });
    if (wasLoading) {
      this.loader.start();
    }
  }
}

import Service from '@ember/service';

export default class LoaderService extends Service {
  target = null;

  setTarget(aTarget) {
    this.target = aTarget;
  }

  start(text) {
    this.target.isLoading(text);
  }

  stop() {
    this.target.finishedLoading();
  }
}

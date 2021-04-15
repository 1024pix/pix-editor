import Service from '@ember/service';

export default class LoaderService extends Service {
  target = null;

  get isLoading() {
    return this.target.loading;
  }

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

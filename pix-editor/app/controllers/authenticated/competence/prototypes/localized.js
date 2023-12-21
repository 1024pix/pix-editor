import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class LocalizedController extends Controller {

  get localizedChallenge() {
    return this.model;
  }

  @action
  getPreviewUrl(locale) {
    return locale ? `${this.localizedChallenge.challenge.get('preview')}?locale=${locale}` : this.localizedChallenge.challenge.get('preview');
  }
}

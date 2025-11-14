import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class LocalizedChallengeController extends Controller {
  @tracked edition = false;

  @action
  edit() {
    this.edition = true;
  }

  @action
  cancelEdit() {
    this.edition = false;
  }
}

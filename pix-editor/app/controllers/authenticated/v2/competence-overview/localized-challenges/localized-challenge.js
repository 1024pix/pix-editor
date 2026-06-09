import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

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

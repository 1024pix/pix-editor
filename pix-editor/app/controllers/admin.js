import Controller from '@ember/controller';

export default class AdminController extends Controller {
  get user() {
    return this.model.user;
  }

  get schemas() {
    return this.model.schemas;
  }
}

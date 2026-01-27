import Controller from '@ember/controller';

export default class AdminEntityListController extends Controller {
  get entityList() {
    return this.model.entityList;
  }

  get schema() {
    return this.model.schema;
  }
}

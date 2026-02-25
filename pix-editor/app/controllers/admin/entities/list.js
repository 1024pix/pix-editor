import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class AdminEntityListController extends Controller {
  queryParams = ['sort'];

  @tracked sort;

  get entityList() {
    return this.model.entityList;
  }

  get schema() {
    return this.model.schema;
  }
}

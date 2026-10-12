import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ModulesProductionController extends Controller {
  queryParams = ['pageNumber', 'pageSize', 'internalTitle'];

  @tracked pageNumber = 1;
  @tracked pageSize = 10;
  @tracked internalTitle = '';

  @action
  updateInternalTitleFilter(internalTitle) {
    this.pageNumber = 1;
    this.internalTitle = internalTitle;
  }

  @action
  clearFilters() {
    this.pageNumber = 1;
    this.internalTitle = '';
  }
}

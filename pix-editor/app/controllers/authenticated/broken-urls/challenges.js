import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlsController extends Controller {
  queryParams = ['url', 'statusCode'];
  @tracked url = '';
  @tracked statusCode = '';

  @action
  applyFilters(field, filterValue) {
    this[field] = filterValue ?? '';
  }

  @action
  clearFilters() {
    this.url = '';
    this.statusCode = '';
  }
}

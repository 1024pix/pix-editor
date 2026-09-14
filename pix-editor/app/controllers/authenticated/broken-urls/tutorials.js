import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class BrokenUrlsController extends Controller {
  queryParams = ['url', 'statusCode', 'skills'];
  @tracked url = '';
  @tracked statusCode = '';
  @tracked skills = [];

  @action
  applyFilters(field, filterValue) {
    this[field] = filterValue ?? '';
  }

  @action
  clearFilters() {
    this.url = '';
    this.statusCode = '';
    this.skills = [];
  }
}

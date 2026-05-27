import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class ModulesProductionController extends Controller {
  queryParams = ['pageNumber', 'pageSize'];

  @tracked pageNumber = 1;
  @tracked pageSize = 10;
}

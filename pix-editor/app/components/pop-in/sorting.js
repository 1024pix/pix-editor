import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';


export default class PopInSortingComponent extends Component {

  @tracked sortedModel;

  // force tracking of model sorting
  get models() {
    if (this.sortedModel) {
      return this.sortedModel;
    }
    return this.args.model;
  }

  @action
  reorderItems(models) {
    models.forEach((model, index) => model.index = index);
    this.sortedModel = models;
  }
}

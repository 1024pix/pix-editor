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

  get title() {
    return this.args.title ? this.args.title : 'no_sorting_title';
  }

  @action
  reorderItems(models) {
    models.forEach((model, index) => model.index = index);
    this.sortedModel = models;
  }

  @action
  onDeny(models) {
    if (this.args.onDeny) {
      this.args.onDeny(models);
    }
    return null;
  }

  @action
  onApprove(models) {
    if (this.args.onApprove) {
      this.args.onApprove(models);
    }
    return null;
  }
}

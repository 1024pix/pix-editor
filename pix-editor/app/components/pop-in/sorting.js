import { action } from '@ember/object';
import Component from '@glimmer/component';
import _ from 'lodash';

export default class PopInSortingComponent extends Component {

  get models() {
    return _.sortBy(this.args.model, 'index');
  }

  get title() {
    return this.args.title ? this.args.title : 'no_sorting_title';
  }

  @action
  reorderItems(models) {
    models.forEach((model, index) => model.index = index);
  }

  @action
  onDeny() {
    this.args.onDeny?.(this.args.model);
    return null;
  }

  @action
  onApprove() {
    this.args.onApprove?.(this.args.model);
    return null;
  }
}

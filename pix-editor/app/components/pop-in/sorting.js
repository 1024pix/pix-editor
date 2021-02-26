import Component from '@glimmer/component';
import { action } from '@ember/object';


export default class PopInSortingComponent extends Component {

  @action
  reorderItems(models) {
    models.forEach((model, index)=> {
      model.index = index;
    });
  }
}

import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';


export default class PopInSortingComponent extends Component {

  @tracked selectedTheme = null;

  get isTubeSorting() {
    return this.args.sortingName === 'tube';
  }

  get sortingGroupModel() {
    if (this.selectedTheme) {
      const selectedTheme = this.selectedTheme.data;
      return selectedTheme.tubes;
    }
    if (this.isTubeSorting) {
      return [];
    }
    return this.args.model;
  }

  get themeOptions() {
    const themes = this.args.model;
    return themes.map(theme =>  {
      return {
        label: theme.name,
        data: theme
      };
    });
  }

  @action
  selectTheme(value) {
    this.selectedTheme = value;
  }

  @action
  reorderItems(models) {
    models.forEach((model, index)=> {
      model.index = index;
    });
  }
}

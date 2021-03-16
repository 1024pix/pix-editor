import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';


export default class TubeForm extends Component {
  @service currentData;

  @tracked themesLoaded = false;
  @tracked selectedTheme = false;

  constructor() {
    super(...arguments);
    this.args.setEmptyMandatoryField(true);
  }

  get themeList() {
    const competence = this.currentData.getCompetence();
    return competence.sortedThemes.map(theme => ({
      label: theme.name,
      data: theme
    }));
  }

  @action
  selectTheme(item) {
    const tube = this.args.tube;
    tube.theme = item.data;
    this.selectedTheme = item;
    this.args.setEmptyMandatoryField(false);
  }
}

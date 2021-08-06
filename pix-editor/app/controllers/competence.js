import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import Sentry from '@sentry/ember';

export default class CompetenceController extends Controller {
  queryParams = [{
    'leftMaximized': {
      scope:'controller'
    },
    'view': {
      scope: 'controller'
    }
  }];

  @tracked view = 'production';
  @tracked section = 'challenges';
  @tracked languageFilter = false;
  @tracked leftMaximized = false;
  @tracked displaySortingPopIn = false;
  @tracked sortingPopInTitle = '';
  @tracked sortingPopInApproveAction = null;
  @tracked sortingPopInCancelAction = null;
  @tracked sortingModel;

  @service router;
  @service config;
  @service access;
  @service('file-saver') fileSaver;
  @service notify;
  @service loader;

  @controller('competence.prototypes.single') challengeController;
  @controller('competence.skills.single') skillController;

  get competence() {
    return this.model;
  }

  setSection(value) {
    if (this.section !== value) {
      this.section = value;
    }
  }

  setView(value) {
    if (this.view !== value) {
      this.view = value;
    }
  }

  maximizeLeft(value) {
    if (this.leftMaximized !== value) {
      this.leftMaximized = value;
    }
  }

  get displayGrid() {
    return this.section !== 'challenges' || this.view !== 'workbench-list';
  }

  get size() {
    switch (this.router.currentRouteName) {
      case 'competence.index':
      case 'competence.skills.index':
      case 'competence.prototypes.index':
      case 'competence.quality.index':
      case 'competence.i18n.index':
        return 'full';
      default:
        return 'half';
    }
  }

  get twoColumns() {
    switch (this.router.currentRouteName) {
      case 'competence.prototypes.single.alternatives':
      case 'competence.prototypes.single.alternatives.index':
      case 'competence.prototypes.single.alternatives.single':
      case 'competence.prototypes.single.alternatives.new':
      case 'competence.skills.single.archive.index':
      case 'competence.skills.single.archive.single':
        return true;
      default:
        return false;
    }
  }

  get skillLink() {
    const twoColumns = this.twoColumns;
    if (this.section === 'challenges' && this.view === 'production') {
      if (twoColumns) {
        return 'competence.prototypes.single.alternatives';
      } else {
        return 'competence.prototypes.single';
      }
    } else {
      return 'competence.prototypes.single';
    }
  }

  _formatCSVString(str) {
    if (str) {
      return str.replace(/"/g, '""');
    }
    return ' ';
  }

  _transitionToSection(section) {
    switch (section) {
      case 'skills':
        this.transitionToRoute('competence.skills', this.competence);
        break;
      case 'challenges':
        this.transitionToRoute('competence.prototypes', this.competence);
        break;
      case 'quality':
        this.transitionToRoute('competence.quality', this.competence);
        break;
      case 'i18n':
        this.transitionToRoute('competence.i18n', this.competence);
        break;
    }
  }

  @action
  closeChildComponent() {
    this.maximizeLeft(false);
    this._transitionToSection(this.section);
  }

  @action
  refresh(closeChild) {
    if (closeChild) {
      this.closeChildComponent();
    }
    this.send('refreshModel');
  }

  @action
  newPrototype() {
    this.transitionToRoute('competence.prototypes.new', this.competence);
  }

  @action
  copyChallenge(challenge) {
    this.transitionToRoute('competence.prototypes.new', this.competence, { queryParams: { from: challenge.id } });
  }

  @action
  newTube(theme) {
    this.transitionToRoute('competence.tubes.new', this.competence, { queryParams: { themeId: theme.id } });
  }

  @action
  newTheme() {
    this.transitionToRoute('competence.themes.new', this.competence);
  }

  @action
  exportSkills() {
    this.loader.start('Export des acquis...');
    const competence = this.competence;
    const productionTubes = competence.productionTubes;
    const filledSkills = productionTubes.map(productionTube => productionTube.filledProductionSkills);
    const skillData = filledSkills.flat()
      .filter(filledSkill => filledSkill !== false)
      .map(filledSkill => {
        const tube = filledSkill.tube;
        const description = this._formatCSVString(filledSkill.description);
        return [competence.name, tube.get('name'), filledSkill.name, description];
      });
    const contentCSV = skillData.filter(data => data !== false).reduce((content, data) => {
      return content + `\n${data.map(item => item ? `"${item}"` : ' ').join(',')}`;
    }, '"Compétence","Tube","Acquis","Description"');
    const fileName = `Export_acquis_${competence.name}_${(new Date()).toLocaleString('fr-FR')}.csv`;
    this.fileSaver.saveAs(contentCSV, fileName);
    this.notify.message('acquis exportés');
    this.loader.stop();
  }

  @action
  selectView(value) {
    this.setView(value);
    this.closeChildComponent();
  }

  @action
  selectSection(value) {
    this._transitionToSection(value.id);
  }

  @action
  selectLanguageToFilter(value) {
    this.languageFilter = value.local;
  }

  @action
  displaySortThemesPopIn() {
    this._displaySortPopIn(this.sortThemes, this.cancelThemesSorting, 'Tri des thématiques', this.competence.sortedThemes);
  }

  @action
  displaySortTubesPopIn(tubes) {
    this._displaySortPopIn(this.sortTubes, this.cancelTubesSorting, 'Tri des tubes', tubes);
  }

  _displaySortPopIn(approveAction, cancelAction, title, sortingModel) {
    this.sortingPopInApproveAction = approveAction;
    this.sortingPopInCancelAction = cancelAction;
    this.sortingPopInTitle = title;
    this.sortingModel = sortingModel;
    this.displaySortingPopIn = true;
  }

  @action
  async sortThemes(themes) {
    await this._saveSorting(themes, 'Thématiques ordonnées', 'Erreur lors du trie des thématiques');
  }

  @action
  async sortTubes(tubes) {
    await this._saveSorting(tubes, 'Tubes ordonnés', 'Erreur lors du trie des tubes');
  }

  async _saveSorting(models, successMessage, errorMessage) {
    this.loader.start();
    try {
      for (const model of models) {
        await model.save();
      }
      this.loader.stop();
      this.notify.message(successMessage);
      this.displaySortingPopIn = false;
    } catch (error) {
      console.error(error);
      Sentry.captureException(error);
      this.loader.stop();
      this.notify.error(errorMessage);
    }
  }

  @action
  cancelThemesSorting(themes) {
    this._cancelSorting(themes);
  }

  @action
  cancelTubesSorting(tubes) {
    this._cancelSorting(tubes);
  }

  _cancelSorting(models) {
    models.forEach(model => model.rollbackAttributes());
    this.displaySortingPopIn = false;
  }
}

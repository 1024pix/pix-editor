import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import { inject as controller } from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class CompetenceController extends Controller {
  queryParams = ['leftMaximized', 'view', 'skillView'];

  @tracked view = 'production';
  @tracked skillView = 'production';
  @tracked section = 'challenges';
  @tracked leftMaximized = false;

  @service router;
  @service config;
  @service access;
  @service('file-saver') fileSaver;
  @service notify;
  @service loader;

  @controller('competence.templates.single') challengeController;
  @controller('competence.skills.single') skillController;

  @alias('model')
  competence;

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

  setSkillView(value) {
    if (this.skillView !== value) {
      this.skillView = value;
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
      case 'competence.templates.index':
      case 'competence.quality.index':
      case 'competence.i18n.index':
        return 'full';
      default:
        return 'half';
    }
  }

  get twoColumns() {
    switch (this.router.currentRouteName) {
      case 'competence.templates.single.alternatives':
      case 'competence.templates.single.alternatives.index':
      case 'competence.templates.single.alternatives.single':
      case 'competence.templates.single.alternatives.new':
        return true;
      default:
        return false;
    }
  }

  get skillLink() {
    const twoColumns = this.twoColumns;
    if (this.section === 'challenges' && this.view === 'production') {
      if (twoColumns) {
        return 'competence.templates.single.alternatives';
      } else {
        return 'competence.templates.single';
      }
    } else {
      return 'competence.templates.single';
    }
  }

  _formatCSVString(str) {
    if (str) {
      return str.replace(/"/g, '""');
    }
    return ' ';
  }

  @action
  closeChildComponent() {
    this.maximizeLeft(false);
    this.transitionToRoute('competence', this.competence);
  }

  @action
  refresh(closeChild) {
    if (closeChild) {
      this.closeChildComponent();
    }
    this.send('refreshModel');
  }

  @action
  newTemplate() {
    this.transitionToRoute('competence.templates.new', this.competence);
  }

  @action
  copyChallenge(challenge) {
    this.transitionToRoute('competence.templates.new', this.competence, { queryParams: { from: challenge.id } });
  }

  @action
  newTube() {
    this.transitionToRoute('competence.tubes.new', this.competence);
  }

  @action
  exportSkills() {
    this.loader.start('Export des acquis...');
    const competence = this.competence;
    const productionTubes = competence.productionTubes;
    const filledSkills = productionTubes.map(productionTube => productionTube.filledSkills);
    const skillData = filledSkills.flat()
      .filter(filledSkill => filledSkill !== false)
      .map(filledSkill => {
        const productionTemplate = filledSkill.productionTemplate;
        if (productionTemplate) {
          const tube = filledSkill.tube;
          const description = this._formatCSVString(filledSkill.description);
          return [competence.name, tube.get('name'), filledSkill.name, description];
        } else {
          return false;
        }
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
  selectSkillView(value) {
    this.setSkillView(value);
    this.closeChildComponent();
  }

  @action
  selectSection(value) {
    switch (value.id) {
      case 'skills':
        this.transitionToRoute('competence.skills', this.competence);
        break;
      case 'challenges':
        this.transitionToRoute('competence.templates', this.competence);
        break;
      case 'quality':
        this.transitionToRoute('competence.quality', this.competence);
        break;
      case 'i18n':
        this.transitionToRoute('competence.i18n', this.competence);
        break;
    }
  }
}

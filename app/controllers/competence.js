import classic from 'ember-classic-decorator';
import { action, computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { alias } from '@ember/object/computed';
import Controller from '@ember/controller';
import {inject as controller} from '@ember/controller';

@classic
export default class CompetenceController extends Controller {
  queryParams = ['firstMaximized', 'view'];
  firstMaximized = false;
  view = 'production';
  section = 'challenges';

  @service
  router;

  @service
  config;

  @service
  access;

  @service('file-saver')
  fileSaver;

  @controller
  application;

  @controller('competence.templates.single')
  challengeController;

  @controller('competence.skills.single')
  skillController;

  @alias('model')
  competence;

  @computed('firstMaximized')
  get competenceHidden() {
    return this.get('firstMaximized') ? 'hidden' : '';
  }

  @computed('section', 'view')
  get displayGrid() {
    return this.get('section') != 'challenges' || this.get('view') != 'workbench-list';
  }

  @computed('router.currentRouteName')
  get size() {
    switch(this.get('router.currentRouteName')) {
      case 'competence.index':
      case 'competence.skills.index':
      case 'competence.templates.index':
      case 'competence.quality.index':
              return 'full';
      default:
        return 'half';
    }
  }

  @computed('router.currentRouteName')
  get twoColumns() {
    let routeName = this.get('router.currentRouteName');
    switch (routeName) {
      case 'competence.templates.single.alternatives':
      case 'competence.templates.single.alternatives.index':
      case 'competence.templates.single.alternatives.single':
      case 'competence.templates.single.alternatives.new':
        return true;
      default:
        return false;
    }
  }

  @computed('twoColumns', 'section', 'view')
  get skillLink() {
    let twoColumns = this.get('twoColumns');
    if (this.get('section') === 'challenges' && this.get('view') === 'production') {
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
    this.set('firstMaximized', false);
    this.transitionToRoute('competence', this.get('competence'));
  }

  @action
  refresh(closeChild) {
    if (closeChild) {
      this.send('closeChildComponent');
    }
    this.send('refreshModel');
  }

  @action
  newTemplate() {
    this.transitionToRoute('competence.templates.new', this.get('competence'));
  }

  @action
  copyChallenge(challenge) {
    this.transitionToRoute('competence.templates.new', this.get('competence'), {queryParams: {from: challenge.get('id')}});
  }

  @action
  newTube() {
    this.transitionToRoute('competence.tubes.new', this.get('competence'));
  }

  @action
  exportSkills() {
    this.get('application').send('isLoading','Export des acquis...');
    const competence = this.get('competence');
    const productionTubes = competence.get('productionTubes');
    const filledSkills = productionTubes.map(productionTube => productionTube.get('filledSkills'));
    const skillData = filledSkills.flat()
      .filter(filledSkill => filledSkill !== false)
      .map(filledSkill => {
        const productionTemplate = filledSkill.get('productionTemplate');
        if (productionTemplate) {
          const tube = filledSkill.get('tube');
          const description = this._formatCSVString(filledSkill.description);
          return [competence.get('name'), tube.get('name'), filledSkill.get('name'), description];
        } else {
          return false;
        }
      });
    const contentCSV = skillData.filter(data => data !== false).reduce((content, data) => {
      return content + `\n${data.map(item => item?`"${item}"`:" ").join(',')}`
    }, '"Compétence","Tube","Acquis","Description"');
    const fileName = `Export_acquis_${competence.name}_${(new Date()).toLocaleString('fr-FR')}.csv`;
    this.get("fileSaver").saveAs(contentCSV, fileName);
    this.get('application').send('showMessage', 'acquis exportés', true);
    this.get('application').send('finishedLoading');
  }

  @action
  selectView(value) {
    this.set('view',value);
    this.send('closeChildComponent');
  }

  @action
  selectSection(value) {
    switch(value.id) {
      case 'skills':
        this.transitionToRoute('competence.skills', this.get('competence'));
        break;
      case 'challenges':
        this.transitionToRoute('competence.templates', this.get('competence'));
        break;
      case 'quality':
        this.transitionToRoute('competence.quality', this.get('competence'));
        break;
    }
  }
}

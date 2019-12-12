import Controller from '@ember/controller';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {alias} from '@ember/object/computed';

export default Controller.extend({
  queryParams:['firstMaximized', 'view'],
  firstMaximized:false,
  view:'production',
  section: 'challenges',
  router: service(),
  config: service(),
  access: service(),
  fileSaver: service('file-saver'),
  application: controller(),
  challengeController: controller('competence.templates.single'),
  skillController: controller('competence.skills.single'),
  competence: alias('model'),
  competenceHidden: computed('firstMaximized', function () {
    return this.get('firstMaximized') ? 'hidden' : '';
  }),
  size: computed('router.currentRouteName', function () {
    switch(this.get('router.currentRouteName')) {
      case 'competence.index':
      case 'competence.skills.index':
      case 'competence.templates.index':
        return 'full';
      default:
        return 'half';
    }
  }),
  twoColumns: computed('router.currentRouteName', function () {
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
  }),
  skillLink: computed('twoColumns', 'section', 'view', function () {
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
  }),
  _formatCSVString(str) {
    if (str) {
      return str.replace(/"/g, '""');
    }
    return ' ';
  },
  actions: {
    closeChildComponent() {
      this.set('firstMaximized', false);
      this.transitionToRoute('competence', this.get('competence'));
    },
    refresh(closeChild) {
      if (closeChild) {
        this.send('closeChildComponent');
      }
      this.send('refreshModel');
    },
    newTemplate() {
      this.transitionToRoute('competence.templates.new', this.get('competence'));
    },
    copyChallenge(challenge) {
      this.transitionToRoute('competence.templates.new', this.get('competence'), {queryParams: {from: challenge.get('id')}});
    },
    newTube() {
      this.transitionToRoute('competence.tube.new', this.get('competence'));
    },
    exportSkills() {
      this.get('application').send('isLoading','Export des acquis...');
      const competence = this.get('competence');
      return competence.get('productionTubes')
        .then(productionTubes => {
          const getFilledSkills = productionTubes.map(productionTube => productionTube.get('filledSkills'));
          return Promise.all(getFilledSkills);
        })
        .then(filledSkills => {
          const getSkillData = filledSkills.flat()
            .filter(filledSkill => filledSkill !== false)
            .map(filledSkill => {
              return filledSkill.get('productionTemplate')
                .then(productionTemplate => {
                  if (productionTemplate) {
                    return filledSkill.get('tube')
                      .then(tube => {
                        const description = this._formatCSVString(filledSkill.description);
                        return [competence.name, tube.name, filledSkill.name, description];
                      });
                  } else {
                    return Promise.resolve(false);
                  }
                })

            });
          return Promise.all(getSkillData)
        }).then(skillData => {
          const contentCSV = skillData.filter(data => data !== false).reduce((content, data) => {
            return content + `\n${data.map(item => item?`"${item}"`:" ").join(',')}`
          }, '"Compétence","Tube","Acquis","Description"');
          const fileName = `Export_acquis_${competence.name}_${(new Date()).toLocaleString('fr-FR')}.csv`;
          this.get("fileSaver").saveAs(contentCSV, fileName);
          this.get('application').send('showMessage', 'acquis exportés', true);
        }).finally(() => {
          this.get('application').send('finishedLoading');
        })
    },
    selectView(value) {
      this.set('view',value);
      this.send('closeChildComponent');
    },
    selectSection(value) {
      switch(value) {
        case 'skills':
          this.transitionToRoute('competence.skills', this.get('competence'));
          break;
        case 'challenges':
          this.transitionToRoute('competence.templates', this.get('competence'));
          break;
        case 'quality':
          //TODO: créer une route dédiée
          this.set('section', 'quality');
          break;
      }
    }
  }
});

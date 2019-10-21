import Controller from '@ember/controller';
import {computed} from '@ember/object';
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {alias} from '@ember/object/computed';

export default Controller.extend({
  childComponentMaximized: false,
  view: 'production',
  router: service(),
  config: service(),
  access: service(),
  fileSaver: service('file-saver'),
  application: controller(),
  challengeController: controller('competence.templates.single'),
  skillController: controller('competence.skill.index'),
  competence: alias('model'),
  competenceHidden: computed('childComponentMaximized', function () {
    return this.get('childComponentMaximized') ? 'hidden' : '';
  }),
  section: computed('view', function () {
    const view = this.get('view');
    switch (view) {
      case 'production':
      case 'workbench':
      case 'workbench-list':
        return 'challenges';
      default:
        return view;
    }
  }),
  size: computed('router.currentRouteName', function () {
    if (this.get('router.currentRouteName') == 'competence.index') {
      return 'full';
    } else {
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
  skillLink: computed('twoColumns', 'view', function () {
    let twoColumns = this.get('twoColumns');
    if (this.get('view') === 'production') {
      if (twoColumns) {
        return 'competence.templates.single.alternatives';
      } else {
        return 'competence.templates.single';
      }
    } else {
      return 'competence.templates.single';
    }
  }),
  _transitionToSkillFromChallengeRoute() {
    let challenge = this.get('challengeController').get('challenge');
    if (!challenge) {
      return
    }
    return challenge.get('isWorkbench')
      .then(workbench => {
        if (workbench) {
          this.send('closeChildComponent');
        } else {
          return challenge.get('skills')
            .then(skills => {
              if (skills.length > 0) {
                this.transitionToRoute('competence.skill.index', this.get('competence'), skills.get('firstObject'));
              } else {
                this.send('closeChildComponent');
              }
            });
        }
      });
  },
  _getSkillProductionTemplate() {
    let skill = this.get('skillController').get('skill');
    if (skill) {
      return skill.get('productionTemplate')
    }
    this.send('closeChildComponent');
    return Promise.resolve();

  },
  _transitionToChallengeFromSkill() {
    return this._getSkillProductionTemplate()
      .then(template => {
        if (template) {
          this.transitionToRoute('competence.templates.single', this.get('competence'), template);
        } else {
          this.send('closeChildComponent');
        }
      })
  },
  _formatCSVString(str){
    if(str){
      return str.replace(/"/g, '""')
    }
     return ' '
  },
  actions: {
    maximizeChildComponent() {
      this.set('childComponentMaximized', true);
    },
    minimizeChildComponent() {
      this.set('childComponentMaximized', false);
    },
    closeChildComponent() {
      this.set('childComponentMaximized', false);
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
    showAlternatives(challenge) {
      this.transitionToRoute('competence.templates.single.alternatives', this.get('competence'), challenge);
    },
    shareSkills() {
      let buildCSV = [];
      const competence = this.get('competence');
      competence.get('productionTubes')
        .then(async productionTubes => {
         await productionTubes.forEach(productionTube => {
            productionTube.get('filledSkills')
              .then(async filledSkills => {
                const skills = await filledSkills.reduce((array, skill) => {
                  if (skill) {
                    skill.get('productionTemplate')
                      .then(template => {
                        if (template) {
                          array.push([skill, template.instructions]);
                          return array
                        }
                      })
                  }
                  return array
                }, []);
                skills.forEach(skill => {
                 const description = this._formatCSVString(skill[0].description);
                 const instruction = this._formatCSVString(skill[1]);
                 const clue = this._formatCSVString(skill[0].clue);
                  buildCSV.push(['"'+competence.name, productionTube.name, skill[0].name, description, instruction, clue+'"'])
                });
                return buildCSV
              })
          });
          return buildCSV
        }).then(()=>{
        const content = buildCSV.reduce((content, row) => {
          return content +`\n${row.join('","')}`
        }, '"Comptétence","Tube","Acquis","Description","consigne","indice"');
        const fileName = `Description_acquis_${competence.name}_${(new Date()).toLocaleString('fr-FR')}.csv`;
        this.get("fileSaver").saveAs(content, fileName);
        })

    },
    selectSection(value) {
      if (value === 'challenges') {
        this.send('selectView', 'production');
        return this._transitionToChallengeFromSkill()
      } else {
        this.send('selectView', value);
      }
    },
    selectView(value, closeChild) {
      const previousView = this.get('view');
      const previousSection = this.get('section');

      this.set('view', value);

      if (closeChild) {
        this.send('closeChildComponent');
      }

      if (value === 'skills') {
        if (previousSection === 'challenges') {
          if (previousView !== 'production') {
            this.send("closeChildComponent");
            return;
          }
          return this._transitionToSkillFromChallengeRoute();
        }
      }
      if (value === 'quality') {
        if (previousSection === 'challenges') {
          if (previousView !== 'production') {
            this.send("closeChildComponent");
            return;
          }
          return this._transitionToSkillFromChallengeRoute();
        } else {
          return this._getSkillProductionTemplate()
            .then(template => {
              if (!template) {
                this.send("closeChildComponent");
              }
            })
        }
      }
    }
  }
});

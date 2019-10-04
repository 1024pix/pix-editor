import Controller from "@ember/controller";
import {computed} from "@ember/object";
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {alias} from "@ember/object/computed";

export default Controller.extend({
  childComponentMaximized: false,
  currentView: 'challenges',
  listViews: null,
  listView: false,
  production: true,
  router: service(),
  config: service(),
  access: service(),
  application: controller(),
  challengeController: controller("competence.templates.single"),
  skillController: controller("competence.skill.index"),
  competence: alias("model"),
  init() {
    this._super(...arguments);
    this.skillMode = false;
    this.qualityMode = false;
    this.challengeMode = true;
    this.listColumns = [{
      title: "Acquis",
      propertyName: "skills"
    }, {
      title: "Consigne",
      propertyName: "instructions"
    }, {
      title: "Type",
      propertyName: "type"
    }, {
      title: "Statut",
      propertyName: "status"
    }
    ];
    this.listViews = [{
      title: 'Epreuves',
      id: 'challenges'
    }, {
      title: 'Acquis',
      id: 'skills'
    }, {
      title: 'Qualité',
      id: 'quality'
    }];
  },
  mayCreateTemplate: computed("config.access", function () {
    return this.get("access").mayCreateTemplate();
  }),
  mayCreateTube: computed("config.access", function () {
    return this.get("access").mayCreateTube();
  }),
  competenceHidden: computed("childComponentMaximized", function () {
    return this.get("childComponentMaximized") ? "hidden" : "";
  }),
  size: computed("router.currentRouteName", function () {
    if (this.get("router.currentRouteName") == 'competence.index') {
      return "full";
    } else {
      return "half";
    }
  }),
  twoColumns: computed("router.currentRouteName", function () {
    let routeName = this.get("router.currentRouteName");
    switch (routeName) {
      case "competence.templates.single.alternatives":
      case "competence.templates.single.alternatives.index":
      case "competence.templates.single.alternatives.single":
      case "competence.templates.single.alternatives.new":
        return true;
      default:
        return false;
    }
  }),
  skillLink: computed("twoColumns", "production", function () {
    let twoColumns = this.get("twoColumns");
    if (this.get("production")) {
      if (twoColumns) {
        return "competence.templates.single.alternatives";
      } else {
        return "competence.templates.single";
      }
    } else {
      return "competence.templates.single";
    }
  }),
  _transitionToSkillFromChallengeRoute() {
    let challenge = this.get("challengeController").get("challenge");
    if (!challenge) {
      return
    }
    return challenge.get('isWorkbench')
      .then(workbench => {
        if (workbench) {
          this.send("closeChildComponent");
        } else {
          return challenge.get('skills')
            .then(skills => {
              if (skills.length > 0) {
                this.transitionToRoute("competence.skill.index", this.get("competence"), skills.get('firstObject'));
              } else {
                this.send("closeChildComponent");
              }
            });
        }
      });
  },
  _getSkillProductionTemplate() {
    let skill = this.get("skillController").get("skill");
    if (skill) {
      return skill.get('productionTemplate')
    }
    this.send("closeChildComponent");

  },
  async _transitionToChallengeFromSkill() {
    const template = await this._getSkillProductionTemplate();
    if (template) {
      this.transitionToRoute("competence.templates.single", this.get("competence"), template);
    } else {
      this.send("closeChildComponent");
    }
  },
  actions: {
    maximizeChildComponent() {
      this.set("childComponentMaximized", true);
    },
    minimizeChildComponent() {
      this.set("childComponentMaximized", false);
    },
    closeChildComponent() {
      this.set("childComponentMaximized", false);
      this.transitionToRoute("competence", this.get("competence").get("id"));
    },
    refresh(closeChild) {
      if (closeChild) {
        this.send("closeChildComponent");
      }
      this.send("refreshModel");
    },
    setListView() {
      this.set("listView", true);
    },
    setGridView() {
      this.set("listView", false);
    },
    newTemplate() {
      this.transitionToRoute("competence.templates.new", this.get("competence"));
    },
    copyChallenge(challenge) {
      this.transitionToRoute("competence.templates.new", this.get("competence"), {queryParams: {from: challenge.get("id")}});
    },
    newTube() {
      this.transitionToRoute("competence.tube.new", this.get("competence"));
    },
    showAlternatives(challenge) {
      this.transitionToRoute("competence.templates.single.alternatives", this.get("competence"), challenge);
    },
    shareSkills() {
      this.get("application").send("showMessage", "Bientôt disponible...", true);
    },
    switchProduction(closeChild) {
      this.set("production", true);
      this.set("listView", false);
      if (closeChild) {
        this.send("closeChildComponent");
      }
    },
    switchDraft(closeChild) {
      this.set("production", false);
      if (closeChild) {
        this.send("closeChildComponent");
      }
    },

    async selectView(value) {
      const switchToSkillView = value === 'skills';
      const switchToQualityView = value === 'quality';
      const switchToChallengeView = value === 'challenges';

      const comeFromChallengeRoute = this.get('challengeMode');
      const production = this.get('production');

      this.set('currentView', value);
      this.set('skillMode', switchToSkillView);
      this.set('qualityMode', switchToQualityView);
      this.set('challengeMode', switchToChallengeView);

      this.set("listView", false);

      if (switchToSkillView) {
        if (comeFromChallengeRoute) {
          if (!production) {
            this.send("closeChildComponent");
            return
          }
          this._transitionToSkillFromChallengeRoute();
        }
      }
      if (switchToQualityView) {
        if (comeFromChallengeRoute) {
          if (!production) {
            this.send("closeChildComponent");
            return
          }
          this._transitionToSkillFromChallengeRoute();
        } else {
          const template = await this._getSkillProductionTemplate();
          if (!template) {
            this.send("closeChildComponent");
          }
        }
      }
      if (switchToChallengeView) {
        this._transitionToChallengeFromSkill()
      }

    }
  }
});

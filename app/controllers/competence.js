import Controller from "@ember/controller";
import {computed} from "@ember/object";
import {inject as service} from '@ember/service';
import {inject as controller} from '@ember/controller';
import {alias} from "@ember/object/computed";
import { isEqual } from '@ember/utils';

export default Controller.extend({
  childComponentMaximized: false,
  skillMode: false,
  qualityMode:false,
  selectedView: 'classique',
  listViews: [
    {
      title: 'Classique',
      id: 'classique'
    }, {
      title: 'Gestion des acquis',
      id: 'acquis'
    },{
    title:'Qualité',
      id:'quality'
    }
  ],
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
    selectView(value) {
      let skillMode = isEqual(value, 'acquis');
      this.set('skillMode', skillMode);
      let quality = isEqual(value, 'quality');
      this.set('qualityMode', quality);
      let currentRoute = this.get("router.currentRouteName");
      if (skillMode || quality) {
        this.set("listView", false);
      }
      if(quality && !this.get('production')){
        this.set('production', true)
      }
      if (currentRoute.startsWith("competence.templates.single")) {
        if(value==='acquis'){
          let challenge = this.get("challengeController").get("challenge");
          return challenge.get('isWorkbench')
            .then(workbench => {
              if (workbench) {
                this.transitionToRoute("competence.index", this.get("competence").get("id"));
                this.send("closeChildComponent");
              } else {
                return challenge.get('skills')
                  .then(skills => {
                    if (skills.length > 0) {
                      this.transitionToRoute("competence.skill.index", this.get("competence"), skills.get('firstObject'));
                    } else {
                      this.transitionToRoute("competence.index", this.get("competence").get("id"));
                      this.send("closeChildComponent");
                    }
                  });
              }
            });
        }
      } else if ((value==='classique'||value==='quality') && currentRoute.startsWith("competence.skill")) {
        let skill = this.get("skillController").get("skill");
        if (skill) {
          return skill.get('productionTemplate')
            .then(template => {
              if (template) {
                this.transitionToRoute("competence.templates.single", this.get("competence"), template);
              } else {
                this.transitionToRoute("competence.index", this.get("competence").get("id"));
                this.send("closeChildComponent");
              }
            });
        } else {
          this.send("closeChildComponent");
        }
      } else {
        this.send("closeChildComponent");
      }
    }
  }
});

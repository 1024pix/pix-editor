import Controller from "@ember/controller";
import {computed, observer} from "@ember/object";
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { alias } from "@ember/object/computed";

export default Controller.extend({
  childComponentMaximized:false,
  skillMode:false,
  listView:false,
  router:service(),
  application:controller(),
  currentChallenge:null,
  currentSkill:null,
  competence:alias("model.competence"),
  challenges:alias("model.challenges"),
  init() {
    this._super(...arguments);
    this.listColumns = [{
      title:"Acquis",
      propertyName:"skills"
    },{
      title:"Consigne",
      propertyName:"instructions"
    },{
      title:"Type",
      propertyName: "type"
    },{
      title:"Statut",
      propertyName: "status"
    }
  ];
  },
  competenceHidden:computed("childComponentMaximized", function() {
    return this.get("childComponentMaximized")?"hidden":"";
  }),
  childComponentAdapter:observer("skillMode", function() {
    let skillMode = this.get("skillMode");
    let currentRoute = this.get("router.currentRouteName");
    if (skillMode && currentRoute === "competence.challenge") {
      /*let challenge = this.get("currentChallenge");
      let skillNames = challenge.get("skillNames")
      if (skills.length>0) {
        let skill = skills.get("firstObject");
        console.debug(skill);
        this.transitionToRoute("competence.skill", this.get("competence").get("id"), skill.get("id"));
      }*/
      //TODO: link to correct skill
      this.transitionToRoute("competence.index",  this.get("competence").get("id"));
    } else if (!skillMode && currentRoute === "competence.skill") {
      /*let skill = this.get("currentSkill");
      let template = skill.get("template");
      if (template) {
        console.log("id");
        console.debug(template.get("id"));
        this.transitionToRoute("competence.challenge", this.get("competence").get("id"), template.get("id"));
      } else {
        this.transitionToRoute("competence.index",  this.get("competence").get("id"));
      }*/
      //TODO: link to correct challenge
      this.transitionToRoute("competence.index",  this.get("competence").get("id"));
    }
  }),
  actions: {
    maximizeChildComponent() {
      this.set("childComponentMaximized", true);
    },
    minimizeChildComponent() {
      this.set("childComponentMaximized", false);
    },
    closeChildComponent(refresh) {
      this.set("childComponentMaximized", false);
      this.transitionToRoute("competence", this.get("model.competence").get("id"));
      if (refresh) {
        this.send("refreshModel");
      }
    },
    refresh() {
      this.send("closeChildComponent", true);
    },
    setListView() {
      this.set("listView", true);
    },
    setGridView() {
      this.set("listView", false);
    },
    newTemplate() {
      this.transitionToRoute("competence.new-template", this.get("model.competence").get("id"));
    },
    soon() {
      this.get("application").send("showMessage", "Disponible bientôt...", true);
    },
    addChallenge(challenge) {
      this.get("challenges").addObject(challenge);
    }
  },
  size:computed("router.currentRouteName", function() {
    if (this.get("router.currentRouteName") == 'competence.index') {
      return "full";
    } else {
      return "half";
    }
  })
});

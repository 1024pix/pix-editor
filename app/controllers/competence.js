import Controller from "@ember/controller";
import {computed, observer} from "@ember/object";
import { inject as service } from '@ember/service';
import { inject as controller } from '@ember/controller';
import { alias } from "@ember/object/computed";

export default Controller.extend({
  challengeCount:0,
  childComponentMaximized:false,
  skillMode:false,
  listView:false,
  router:service(),
  application:controller(),
  challengeController:controller("competence.challenge"),
  skillController:controller("competence.skill"),
  competence:alias("model"),
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
    if (skillMode) {
      this.set("listView", false);
    }
    if (skillMode && currentRoute.startsWith("competence.challenge")) {
      let challenge = this.get("challengeController").get("challenge");
      let skills = challenge.get("skills");
      if (skills.length>0) {
        this.transitionToRoute("competence.skill", this.get("competence"), skills[0]);
      } else {
        this.transitionToRoute("competence.index",  this.get("competence").get("id"));
      }
    } else if (!skillMode && currentRoute.startsWith("competence.skill")) {
      let skill = this.get("skillController").get("skill");
      let template = skill.get("template");
      if (template) {
        this.transitionToRoute("competence.challenge", this.get("competence"), template);
      } else {
        this.transitionToRoute("competence.index",  this.get("competence").get("id"));
      }
    }
  }),
  size:computed("router.currentRouteName", function() {
    if (this.get("router.currentRouteName") == 'competence.index') {
      return "full";
    } else {
      return "half";
    }
  }),
  twoColumns:computed("router.currentRouteName", function() {
    let routeName = this.get("router.currentRouteName");
    switch (routeName) {
      case "competence.challenge.alternatives":
      case "competence.challenge.alternatives.index":
      case "competence.challenge.alternatives.alternative":
      case "competence.challenge.alternatives.new-alternative":
        return true;
      default:
        return false;
    }
  }),
  challengeLink:computed("twoColumns", function() {
    if (this.get("twoColumns")) {
      return "competence.challenge.alternatives";
    } else {
      return "competence.challenge";
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
    newChallenge() {
      this.transitionToRoute("competence.new-template", this.get("competence"));
    },
    copyChallenge(challengeId) {
      this.transitionToRoute("competence.new-template", this.get("competence"), { queryParams: { from: challengeId}});
    },
    soon() {
      this.get("application").send("showMessage", "Bientôt disponible...", true);
    },
    addChallenge(challenge) {
      this.get("challenges").addObject(challenge);
      this.set("challengeCount", this.get("challengeCount")+1);
    },
    removeChallenge(challenge) {
      let challenges = this.get("challenges");
      if (challenges.includes(challenge)) {
        challenges.removeObject(challenge);
        this.set("challengeCount", this.get("challengeCount")-1);
      }
    },
    showAlternatives(challenge) {
      this.transitionToRoute("competence.challenge.alternatives", this.get("competence"), challenge);
    }
  }
});

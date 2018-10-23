import Controller from '@ember/controller';
import $ from 'jquery';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
  elementClass:"template-challenge",
  parentController:controller("competence"),
  config:service(),
  maximized:false,
  copyOperation:false,
  edition:false,
  creation:false,
  wasMaximized:false,
  updateCache:true,
  alternative:false,
  defaultSaveChangelog:"Mise à jour du prototype",
  challenge:alias("model"),
  application:controller(),
  storage:service(),
  pixConnector:service(),
  copyZoneId:"copyZone",
  mayUpdateCache:alias("pixConnector.connected"),
  challengeTitle:computed("creation","challenge", function() {
    if (this.get("creation")) {
      return "Nouveau prototype";
    } else {
      return this.get("challenge.skillNames");
    }
  }),
  mayEdit:computed("config.lite", "challenge.isDraft", function() {
    return (!this.get("config.lite") || !this.get("challenge.isValidated"));
  }),
  mayDuplicate:computed("config.lite", "challenge.isTemplate", function() {
    return (!this.get("config.lite") || !this.get("challenge.isTemplate"));
  }),
  mayAccessLog:computed("config.lite", function() {
    return !this.get("config.lite");
  }),
  actions:{
    showIllustration: function(){
      let illustration = this.get("challenge.illustration")[0];
      this.get("application").send("showPopinImage", illustration.url);
    },
    maximize() {
      this.set("maximized", true);
      this.get("parentController").send("maximizeChildComponent");
    },
    minimize() {
      this.set("maximized", false);
      this.get("parentController").send("minimizeChildComponent");
    },
    close() {
      this.set("maximized", false);
      this.get("parentController").send("closeChildComponent");
    },
    preview() {
      let challenge = this.get("challenge");
      window.open(challenge.get("preview"), challenge.get("id"));
    },
    openAirtable() {
      let challenge = this.get("challenge");
      let config = this.get("config");
      window.open(config.get("airtableUrl")+config.get("tableChallenges")+"/"+challenge.get("id"), "airtable");
    },
    copyLink() {
      this.set("copyOperation", true);
      scheduleOnce('afterRender', this, function() {
        let element = document.getElementById(this.get("copyZoneId"));
        element.select();
        try {
          var successful = document.execCommand("copy");
          if (!successful) {
            this.get("application").send("showMessage", "Erreur lors de la copie", false);
          } else {
            this.get("application").send("showMessage", "lien copié", true);
          }
        } catch (err) {
          this.get("application").send("showMessage", "Erreur lors de la copie", false);
        }
        this.set("copyOperation", false);
      });
    },
    edit() {
      let state = this.get("maximized");
      this.set("wasMaximized", state);
      this.send("maximize");
      this.set("edition", true);
      $("."+this.get("elementClass")+".challenge-data" ).scrollTop(0);
    },
    cancelEdit() {
      this.set("edition", false);
      let challenge = this.get("challenge");
      challenge.rollbackAttributes();
      let previousState = this.get("wasMaximized");
      if (!previousState) {
        this.send("minimize");
      }
      this.get("application").send("showMessage", "Modification annulée", true);
    },
    save() {
      this.get("application").send("getChangelog", this.get("defaultSaveChangelog"), (changelog) => {
        this.get("application").send("isLoading");
        return this._saveChallenge()
        .then(() => {
          if (changelog) {
            return this._saveChangelog(changelog);
          } else {
            return Promise.resolve();
          }
        })
        .then(() => {
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Épreuve mise à jour", true);
          let challenge = this.get("challenge");
          if (challenge.get("isArchived")) {
            this.get("parentController").send("removeChallenge", challenge);
            this.send("close");
            this.get("parentController").send("refresh");
          }
        }).catch(() => {
          this.get("application").send("finishedLoading");
          this.get("application").send("showMessage", "Erreur lors de la mise à jour", false);
        });
      });
    },
    duplicate() {
      this.get("parentController").send("copyChallenge", this.get("challenge"));
    },
    showAlternatives() {
      this.get("parentController").send("showAlternatives", this.get("challenge"));
    },
    publish() {
      this.get("application").send("confirm", "Mise en production", "Êtes-vous sûr de vouloir mettre l'épreuve en production ?", (result) => {
        if (result) {
          this.get("application").send("getChangelog", "Mise en production de la déclinaison", (changelog) => {
            this.get("application").send("isLoading");
            return this._publishChallenge()
            .then(() => {
              if (changelog) {
                return this._saveChangelog(changelog);
              } else {
                return Promise.resolve();
              }
            })
            .then(() => {
              this.get("application").send("finishedLoading");
              this.get("application").send("showMessage", "Mise en production réussie", true);
              this.send("close");
              this.get("parentController").send("refresh");
            })
            .catch(() =>{
              this.get("application").send("finishedLoading");
              this.get("application").send("showMessage", "Erreur lors de la mise en production", false);
            });
          });
        } else {
          this.get("application").send("showMessage", "Mise en production abandonnée", true);
        }
      });
    },
    challengeLog() {
      this.get("application").send("showChallengeLog", this.get("challenge"), this.get("competence"));
    },
    init() {
      if (!this.get("challenge.isValidated")) {
        this.get("parentController").send("switchDraft", true);
      } else {
        this.get("parentController").send("switchProduction", true);
      }
    }
  },
  _saveChallenge() {
    let challenge = this.get("challenge");
    // check for illustration upload
    let illustration = challenge.get("illustration");
    let uploadIllustration;
    if (illustration && illustration.length>0 && illustration.get('firstObject').file) {
      let file = illustration.get('firstObject').file;
      this.get("application").send("isLoading", "Envoi de l'illustration...");
      uploadIllustration = this.get("storage").uploadFile(file);
    } else {
      uploadIllustration = Promise.resolve(false);
    }

    // check for attachments upload
    let attachments = challenge.get("attachments");
    let uploadAttachments;
    let uploadAttachmentRequired = false;
    if (attachments) {
      let storage = this.get("storage");
      uploadAttachments = attachments.reduce((current, value) => {
        if (value.file) {
          current.push(storage.uploadFile(value.file));
          uploadAttachmentRequired = true;
        } else {
          current.push(Promise.resolve(value));
        }
        return current;
      }, []);
    }

    return uploadIllustration.then((newIllustration) => {
      if (newIllustration) {
        challenge.set("illustration", [{url:newIllustration.url, filename:newIllustration.filename}]);
      }
      if (uploadAttachmentRequired) {
        this.get("application").send("isLoading", "Envoi des pièces jointes...");
        return Promise.all(uploadAttachments);
      } else {
        return Promise.resolve(false);
      }
    }).then((newAttachments) => {
      this.get("application").send("isLoading", "Enregistrement...");
      if (newAttachments) {
        challenge.set("attachments", newAttachments);
      }
      return challenge.save();
    }).then(() => {
      this.set("edition", false);
      let previousState = this.get("wasMaximized");
      if (!previousState) {
        this.send("minimize");
      }
      if (this.get("mayUpdateCache") && this.get("updateCache")) {
        this.get("application").send("isLoading", "Mise à jour du cache...");
        return this.get("pixConnector").updateCache(challenge)
        .catch(() => {
          this.get("application").send("showMessage", "Impossible de mettre à jour le cache", false);
          return Promise.resolve(true);
        });
      } else {
        return Promise.resolve(true);
      }
    });
  },
  _publishChallenge() {
    // TODO: à revoir
    // CHECKS
    this.get("application").send("isLoading", "Vérifications");
    let challenge = this.get("challenge");
    if (!challenge.get("workbench")){
      this.get("application").send("showMessage", "L'épreuve est DÉJÀ en production", false);
      return Promise.reject();
    }
    let alternativeIndex = challenge.get("alternativeIndex");
    if (!alternativeIndex) {
      this.get("application").send("showMessage", "L'épreuve n'a pas d'indice", false);
      return Promise.reject();
    }
    let store = this.get("store");
    let productionChallenge;
    let skillIds;
    let skillNames;
    try {
      skillIds = challenge.get("skills").reduce((current, skillId) => {
        let workbenchSkill = store.peekRecord("workbenchSkill", skillId);
        if (!workbenchSkill) {
          throw skillId;
        }
        current.push(workbenchSkill.get("skillId"));
        return current;
      }, []);
      skillNames = skillIds.reduce((current, skillId) => {
        let productionSkill = store.peekRecord("skill", skillId);
        if (!productionSkill) {
          throw skillId;
        }
        current.push(productionSkill.get("name"));
        return current;
      }, []);
    } catch (e) {
      this.get("application").send("showMessage", "Acquis "+e+" introuvable", false);
      return Promise.reject();
    }
    let index = skillNames.join("")+"_"+1+"_"+alternativeIndex;
    return store.query("challenge", {filterByFormula:"FIND('"+index+"', {Identifiant})"})
    .then((result) => {
      if (result.get("length")>0) {
        this.get("application").send("showMessage", "Une épreuve avec le même indice est déjà en production", false);
        return Promise.reject();
      }
      // CREATE PRODUCTION CHALLENGE
      this.get("application").send("isLoading", "Enregistrement en PRODUCTION");
      productionChallenge = challenge.publish();
      productionChallenge.set("skills", skillIds);
      productionChallenge.set("pixId", index);
      productionChallenge.set("competence", [this.get("competence.id")]);
      return productionChallenge.save();
    })
    .then(() => {
      // ARCHIVE WORKBENCH CHALLENGE
      this.get("application").send("isLoading", "Mise à jour de la base AVAL");
      challenge.archive();
      return challenge.save();
    });
  },
  _saveChangelog(text) {
    //TODO: à revoir
    let challenge = this.get("challenge");
    let entry = this.get("store").createRecord("changelogEntry",{text:text, challengeId:challenge.get("id"), author:this.get("config").get("author"), competence: this.get("competence.code"), skills:challenge.get("joinedSkills"), createdAt:(new Date()).toISOString(), production:!challenge.get("workbench")});
    return entry.save();
  }
});
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
  access:service(),
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
  challengeTitle:computed("creation","challenge", "challenge.isWorkbench.content", function() {
    if (this.get("creation")) {
      return "Nouveau prototype";
    } else if (this.get('challenge.isWorkbench.content')) {
      return '';
    } else {
      return this.get("challenge.skillNames");
    }
  }),
  mayEdit:computed("config.access", "challenge", "challenge.status", function() {
    return this.get("access").mayEdit(this.get("challenge"));
  }),
  mayDuplicate:computed("config.access", "challenge", function() {
    return this.get("access").mayDuplicate(this.get("challenge"));
  }),
  mayAccessLog:computed("config.access", "challenge", function() {
    return this.get("access").mayAccessLog(this.get("challenge"));
  }),
  mayAccessAirtable:computed("config.access", function() {
    return this.get("access").mayAccessAirtable();
  }),
  mayValidate:computed("config.access", "challenge", "challenge.{status,isWorkbench.content}", function() {
    return this.get("access").mayValidate(this.get("challenge"));
  }),
  mayArchive:computed("config.access", "challenge", "challenge.status", function() {
    return this.get("access").mayArchive(this.get("challenge"));
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
    validate() {
      this.get("application").send("confirm", "Mise en production", "Êtes-vous sûr de vouloir mettre l'épreuve en production ?", (result) => {
        if (result) {
          let defaultLogMessage;
          if (this.get("challenge.isTemplate")) {
            defaultLogMessage = "Mise en production du prototype";
          } else {
            defaultLogMessage = "Mise en production de la déclinaison";
          }
          this.get("application").send("getChangelog", defaultLogMessage, (changelog) => {
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
              this.get("parentController").send("switchProduction", true);
            })
            .catch((error) =>{
              console.error(error);
              this.get("application").send("finishedLoading");
              this.get("application").send("showMessage", "Erreur lors de la mise en production", false);
            });
          });
        } else {
          this.get("application").send("showMessage", "Mise en production abandonnée", true);
        }
      });
    },
    archive() {
      this.get("application").send("confirm", "Archivage", "Êtes-vous sûr de vouloir archiver l'épreuve ?", (result) => {
        if (result) {
          this.get("application").send("getChangelog", "Archivage de l'épreuve", (changelog) => {
            this.get("application").send("isLoading");
            // TODO: archive alternative challenges as well
            return this.get("challenge").archive()
            .then(() => {
              if (changelog) {
                return this._saveChangelog(changelog);
              } else {
                return Promise.resolve();
              }
            })
            .then(() => {
              this.get("application").send("finishedLoading");
              this.get("application").send("showMessage", "Archivage réussi", true);
              this.send("close");
            })
            .catch(() =>{
              this.get("application").send("finishedLoading");
              this.get("application").send("showMessage", "Erreur lors de la mise en production", false);
            });
          });
        } else {
          this.get("application").send("showMessage", "Archivage abandonné", true);
        }
      });
    },
    challengeLog() {
      this.get("application").send("showChallengeLog", this.get("challenge"), this.get("competence"));
    },
    init() {
      let parentController = this.get("parentController");
      if (!this.get("challenge.isValidated")) {
        parentController.send("switchDraft", false);
        return this.get('challenge.isWorkbench')
        .then(workbench => {
          if (workbench) {
            parentController.send("setListView");
          }
        });
      } else {
        parentController.send("switchProduction", false);
      }
      this.set("maximized", parentController.get("childComponentMaximized"));
    },
    showVersions() {
      this.get("challenge.firstSkill")
      .then(firstSkill => {
        this.transitionToRoute("competence.templates.list", firstSkill);
      })
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
    // CHECKS
    this.get("application").send("isLoading", "Vérifications");
    let challenge = this.get("challenge");
    if (challenge.get("isValidated")){
      this.get("application").send("showMessage", "L'épreuve est déjà en production", false);
      return Promise.reject();
    }
    if (challenge.get("isTemplate")) {
      return challenge.get("firstSkill")
      .then(firstSkill => {
        if (firstSkill == null) {
          this.get("application").send("showMessage", "L'épreuve n'est pas rattachée à un acquis", false);
          return Promise.reject();
        }
        return firstSkill.get("productionTemplate");
      })
      .then(previousTemplate => {
        if (previousTemplate != null) {
          return new Promise((resolve, reject) => {
            this.get("application").send("confirm", "Archivage du prototype précédent", "Êtes-vous sûr de vouloir archiver le prototype précédent ?", (result) => {
              if (result) {
                resolve(previousTemplate);
              } else {
                reject();
              }
            })
          });
        } else {
          return Promise.resolve(null);
        }
      })
      .then(previousTemplate => {
        if (previousTemplate != null) {
          // TODO: archive alternative challenges as well
          return previousTemplate.archive();
        } else {
          return Promise.resolve();
        }
      })
      .then(() => {
        return challenge.validate();
      }) // Required ?
      .catch(() => {
        return Promise.reject();
      })
    } else {
      return challenge.get("template")
      .then(template => {
        if (!template.get("isValidated")) {
          this.get("application").send("showMessage", "Le prototype correspondant n'est pas validé", false);
          return Promise.reject();
        } else {
          return challenge.validate();
        }
      })
      .catch(() => {
        return Promise.reject();
      })
    }
  },
  _saveChangelog(text) {
    //TODO: à revoir
    let challenge = this.get("challenge");
    let entry = this.get("store").createRecord("changelogEntry",{text:text, challengeId:challenge.get("id"), author:this.get("config").get("author"), competence: this.get("competence.code"), skills:challenge.get("joinedSkills"), createdAt:(new Date()).toISOString(), production:!challenge.get("workbench")});
    return entry.save();
  }
});
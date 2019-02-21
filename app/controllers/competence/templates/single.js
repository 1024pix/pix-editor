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
            this._errorMessage("Erreur lors de la copie");
          } else {
            this._message("lien copié");
          }
        } catch (err) {
          this._errorMessage("Erreur lors de la copie");
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
      this._message("Modification annulée");
    },
    save() {
      this.get("application").send("getChangelog", this.get("defaultSaveChangelog"), (changelog) => {
        this.get("application").send("isLoading");
        return this._handleIllustration(this.get("challenge"))
        .then(challenge => this._handleAttachments(challenge))
        .then(challenge => this._saveChallenge(challenge))
        .then(challenge => this._handleCache(challenge))
        .then(challenge => this._handleChangelog(challenge, changelog))
        .then(() => {
          this.set("edition", false);
          if (!this.get("wasMaximized")) {
            this.send("minimize");
          }
          this._message("Épreuve mise à jour");
        })
        .catch(() => this._errorMessage("Erreur lors de la mise à jour"))
        .finally(() => this.get("application").send("finishedLoading"));
      });
    },
    duplicate() {
      this.get("parentController").send("copyChallenge", this.get("challenge"));
    },
    showAlternatives() {
      this.get("parentController").send("showAlternatives", this.get("challenge"));
    },
    validate() {
      return this._confirm("Mise en production", "Êtes-vous sûr de vouloir mettre l'épreuve en production ?")
      .then(() => {
        let defaultLogMessage;
        if (this.get("challenge.isTemplate")) {
          defaultLogMessage = "Mise en production du prototype";
        } else {
          defaultLogMessage = "Mise en production de la déclinaison";
        }
        this.get("application").send("getChangelog", defaultLogMessage, (changelog) => {
          this.get("application").send("isLoading");
          return this._validationChecks(this.get("challenge"))
          .then(challenge => this._archivePreviousTemplate(challenge))
          .then(challenge => challenge.validate())
          .then(challenge => this._handleChangelog(challenge, changelog))
          .then(challenge => this._checkSkillsValidation(challenge))
          .then(challenge => this._validateAlternatives(challenge))
          .then(() => {
            this._message("Mise en production réussie");
            this.get("parentController").send("switchProduction", true);
          })
          .catch((error) =>{
            console.error(error);
            this._errorMessage("Erreur lors de la mise en production");
          })
          .finally(() => this.get("application").send("finishedLoading"))
        });
      })
      .catch(() => this._message("Mise en production abandonnée"));
    },
    archive() {
      return this._confirm("Archivage", "Êtes-vous sûr de vouloir archiver l'épreuve ?")
      .then(() => {
        this.get("application").send("getChangelog", "Archivage de l'épreuve", (changelog) => {
          this.get("application").send("isLoading");
          return this.get("challenge").archive()
          .then(challenge => this._archiveAlternatives(challenge))
          .then(challenge => this._handleChangelog(challenge, changelog))
          .then(challenge => this._checkSkillsValidation(challenge))
          .then(() => {
            this._message("Épreuve archivée");
            this.send("close");
          })
          .catch(() => this._errorMessage("Erreur lors de l'archivage"))
          .finally(() => this.get("application").send("finishedLoading"));
        });
      })
      .catch(() => this._message("Archivage abandonné"))
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
  _validationChecks(challenge) {
    this._loadingMessage("Vérifications");
    if (challenge.get("isValidated")){
      return this._error("L'épreuve est déjà en production");
    }
    if (challenge.get("isTemplate")) {
      return challenge.get("firstSkill")
      .then(firstSkill => {
        if (firstSkill == null) {
          return this._error("L'épreuve n'est pas rattachée à un acquis");
        }
        return challenge;
      });
    } else {
      return challenge.get("template")
      .then(template => {
        if (!template.get("isValidated")) {
          return this._error("Le prototype correspondant n'est pas validé");
        }
        return challenge;
      });
    }
  },
  _archivePreviousTemplate(challenge) {
    if (!challenge.get("isTemplate")) {
      return Promise.resolve(challenge);
    }
    return challenge.get("firstSkill")
    .then(skill => skill.get("productionTemplate"))
    .then(template => {
      if (template == null) {
        return challenge;
      }
      return this._confirm("Archivage du prototype précédent", "Êtes-vous sûr de vouloir archiver le prototype précédent ?")
      .then(() => template.archive())
      .then(() => challenge);
    })
  },
  _validateAlternatives(challenge) {
    if (!challenge.get("isTemplate")) {
      return Promise.resolve(challenge);
    }
    return challenge.get("draftAlternatives")
    .then(alternatives => {
      alternatives = alternatives.filter(alternative => {
        return !alternative.get("isArchived");
      });
      if (alternatives.length === 0) {
        return challenge;
      }
      return this._confirm("Mise en production des déclinaisons", "Souhaitez-vous mettre en production les déclinaisons proposées ?")
      .then(() => {
        let alternativesPublication = alternatives.reduce((current, alternative) => {
          current.push(alternative.validate()
          .then(alternative => this._message(`Alternative n°${alternative.get('alternativeVersion')} mise en production`))
          );
          return current;
        }, []);
        return Promise.all(alternativesPublication);
      })
      .catch(() => Promise.resolve())
      .finally(() => challenge);
    })
  },
  _archiveAlternatives(challenge) {
    if (!challenge.get("isTemplate")) {
      return Promise.resolve(challenge);
    }
    return challenge.get("alternatives")
    .then(alternatives => {
      alternatives = alternatives.filter(alternative => {
        return !alternative.get("isArchived");
      });
      if (alternatives.length === 0) {
        return challenge;
      }
      let alternativesArchive = alternatives.reduce((current, alternative) => {
        current.push(alternative.archive()
        .then(alternative => this._message(`Alternative n°${alternative.get('alternativeVersion')} archivée`))
        );
        return current;
      }, []);
      return Promise.all(alternativesArchive);
    })
    .then(() => challenge);
  },
  _checkSkillsValidation(challenge) {
    return challenge.get("skills")
    .then(skills => {
      if (skills.length === 0) {
        return true;
      }
      let skillChecks = skills.reduce((current, skill) => {
        current.push(skill.get("productionTemplate")
        .then(template => {
          if (template) {
            if (!skill.get("isActive")) {
              return skill.activate()
              .then(skill => {
                this._message(`Activation de l'acquis ${skill.get("name")}`);
                return skill;
              });
            }
          } else {
            if (skill.get("isActive")) {
              return skill.deactivate()
              .then(skill => {
                this._message(`Désactivation de l'acquis ${skill.get("name")}`);
                return skill;
              });
            }
          }
          return skill;
        }));
        return current;
      }, []);
      return Promise.all(skillChecks);
    })
    .then(() => challenge);
  },
  _handleIllustration(challenge) {
    // check for illustration upload
    let illustration = challenge.get("illustration");
    if (illustration && illustration.length>0 && illustration.get('firstObject').file) {
      let file = illustration.get('firstObject').file;
      this._loadingMessage("Envoi de l'illustration...");
      return this.get("storage").uploadFile(file)
      .then((newIllustration) => {
        challenge.set("illustration", [{url:newIllustration.url, filename:newIllustration.filename}]);
        return challenge;
      })
    } else {
      return Promise.resolve(challenge);
    }
  },
  _handleAttachments(challenge) {
    // check for attachments upload
    let attachments = challenge.get("attachments");
    if (attachments) {
      let storage = this.get("storage");
      let uploadRequired = false;
      let uploadAttachments = attachments.reduce((current, value) => {
        if (value.file) {
          current.push(storage.uploadFile(value.file));
          uploadRequired = true;
        } else {
          current.push(Promise.resolve(value));
        }
        return current;
      }, []);
      if (uploadRequired) {
        this._loadingMessage("Envoi des pièces jointes...");
        return Promise.all(uploadAttachments)
        .then(newAttachments => {
          challenge.set("attachments", newAttachments);
          return challenge;
        })
      }
    }
    return Promise.resolve(challenge);
  },
  _saveChallenge(challenge) {
    this._loadingMessage("Enregistrement...");
    return challenge.save();
  },
  _handleCache(challenge) {
    if (this.get("mayUpdateCache") && this.get("updateCache")) {
      this._loadingMessage("Mise à jour du cache...");
      return this.get("pixConnector").updateCache(challenge)
      .then(() => {
        return challenge;
      })
      .catch(() => {
        this._errorMessage("Impossible de mettre à jour le cache");
        return challenge;
      })
    }
    return Promise.resolve(challenge);
  },
  _handleChangelog(challenge, changelog) {
    if (changelog) {
      let entry = this.get("store").createRecord("changelogEntry",{text:changelog, challengeId:challenge.get("id"), author:this.get("config").get("author"), competence: this.get("competence.code"), skills:challenge.get("joinedSkills"), createdAt:(new Date()).toISOString(), production:!challenge.get("workbench")});
      return entry.save()
      .then(() => { return challenge; })
    } else {
      return Promise.resolve(challenge);
    }
  },
  _confirm(title, text, parameter) {
    return new Promise((resolve, reject) => {
      this.get("application").send("confirm", title, text, (result) => {
        if (result) {
          resolve(parameter);
        } else {
          reject();
        }
      })
    });
  },
  _message(text) {
    this.get("application").send("showMessage", text, true);
  },
  _loadingMessage(text) {
    this.get("application").send("isLoading", text);
  },
  _errorMessage(text) {
    this.get("application").send("showMessage", text, false);
  },
  _error(text) {
    this._errorMessage(text);
    return Promise.reject();
  }
});
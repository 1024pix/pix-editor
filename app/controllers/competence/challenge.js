import Controller from '@ember/controller';
import $ from 'jquery';
import { inject as controller } from '@ember/controller';
import { inject as service } from '@ember/service';
import { scheduleOnce } from '@ember/runloop';
import { alias } from '@ember/object/computed';
import { computed } from '@ember/object';

export default Controller.extend({
  config:service(),
  maximized:false,
  copyOperation:false,
  edition:false,
  creation:false,
  wasMaximized:false,
  updateCache:true,
  workbench:false,
  challenge:alias("model"),
  competence:controller(),
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
  actions:{
    showIllustration: function(className){
      $(".ui." + className + ".small.modal").modal({dimmerSettings: {closable:true}}).modal('show');
    },
    maximize() {
      this.set("maximized", true);
      this.get("competence").send("maximizeChildComponent");
    },
    minimize() {
      this.set("maximized", false);
      this.get("competence").send("minimizeChildComponent");
    },
    close() {
      this.set("maximized", false);
      this.get("competence").send("closeChildComponent");
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
      $(".challenge-data").scrollTop(0);
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
      this.get("application").send("isLoading");
      return this._saveChallenge()
      .then(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Épreuve mise à jour", true);
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la mise à jour", false);
      });
    },
    duplicate() {
      this.get("competence").send("copyChallenge", this.get("challenge").get("id"));
    },
    showAlternatives() {
      this.get("competence").send("showAlternatives", this.get("challenge"));
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
  }
});
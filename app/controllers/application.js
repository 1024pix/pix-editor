import Controller from '@ember/controller';
import $ from 'jquery';

export default Controller.extend({
  loading:false,
  loadingMessage:"",
  displayConfig:false,
  popinImageSrc:"",
  displayPopinImage:false,
  displayConfirm:false,
  displayChangelog:false,
  confirmTitle:"",
  confirmContent:"",
  confirmCallback:null,
  changelogDefault:"",
  changelogCallback:null,
  init() {
    this._super(...arguments);
    this.messages = [];
  },
  actions: {
    loadCompetence(id) {
      this.transitionToRoute("competence", id);
    },
    toggleSidebar(){
      $('#main-sidebar').sidebar('toggle');
    },
    showMessage(content, positive) {
      let messages = this.get("messages");
      let id = "message_"+Date.now();
      messages.pushObject({text:content, positive:positive?true:false, id:id});
      let that = this;
      window.setTimeout(()=> {
        $("#"+id).transition({animation:"fade", onComplete() {
          let messages = that.get("messages");
          messages.removeAt(0);
        }
      });
      }, 3000)
    },
    isLoading(message) {
      this.set("loading", true);
      this.set("loadingMessage", message);
    },
    finishedLoading() {
      this.set("loading", false);
      this.set("loadingMessage", "");
    },
    openConfiguration() {
      this.set("displayConfig", true);
    },
    configUpdated() {
      this.send("refresh");
    },
    configHidden() {
      this.set("displayConfig", false);
    },
    showPopinImage(src) {
      this.set("popinImageSrc", src);
      this.set("displayPopinImage", true);
    },
    popinImageHidden() {
      this.set("displayPopinImage", false);
    },
    confirm(title, message, callback) {
      this.confirmCallback = callback;
      this.set("confirmTitle", title);
      this.set("confirmContent", message);
      this.set("displayConfirm", true);
    },
    confirmApprove() {
      if (this.confirmCallback) {
        this.confirmCallback(true);
      }
    },
    confirmDeny() {
      if (this.confirmCallback) {
        this.confirmCallback(false);
      }
    },
    confirmHidden() {
      this.set("displayConfirm", false);
    },
    getChangelog(defaultMessage, callback) {
      this.changelogCallback = callback;
      this.set("changelogDefault", defaultMessage);
      this.set("displayChangelog", true);
    },
    changelogApprove(value) {
      if (this.changelogCallback) {
        this.changelogCallback(value);
      }
    },
    changelogDeny() {
      if (this.changelogCallback) {
        this.changelogCallback(false);
      }
    },
    changelogHidden() {
      this.set("displayChangelog", false);
    }
  }
});

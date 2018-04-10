import Controller from '@ember/controller';
import $ from 'jquery';

export default Controller.extend({
  loading:false,
  loadingMessage:"",
  displayConfig:false,
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
    }
  }
});

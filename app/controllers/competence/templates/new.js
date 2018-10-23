import Template from './single';

export default Template.extend({
  creation:true,
  mayUpdateCache:false,
  queryParams: ['from'],
  defaultSaveChangelog:"Création du prototype",
  actions:{
    cancelEdit() {
      this.set("edition", false);
      this.get("application").send("showMessage", "Création annulée", true);
      this.get("parentController").send("closeChildComponent");
    },
    save() {
      this.get("application").send("isLoading");
      return this._saveChallenge()
      .then(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Prototype enregistré", true);
        let challenge = this.get("challenge");
        this.transitionToRoute("competence.templates.single", this.get("competence"), challenge);
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création", false);
      });
    }
  }
});

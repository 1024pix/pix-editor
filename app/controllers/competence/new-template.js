import Challenge from './challenge';

export default Challenge.extend({
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
        this.get("parentController").send("addChallenge", challenge);
        // use id in order to reload models
        this.transitionToRoute("competence.challenge", this.get("competence").get("id"), challenge.get("id"));
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création", false);
      });
    }
  }
});

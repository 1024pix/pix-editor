import Challenge from './challenge';

export default Challenge.extend({
  creation:true,
  mayUpdateCache:false,
  queryParams: ['from'],
  actions:{
    cancelEdit() {
      this.set("edition", false);
      this.get("application").send("showMessage", "Création annulée", true);
      this.get("competence").send("closeChildComponent");
    },
    save() {
      this.get("application").send("isLoading");
      return this._saveChallenge()
      .then(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Prototype enregistré", true);
        let challenge = this.get("challenge");
        this.get("competence").send("addChallenge", challenge);
        this.transitionToRoute("competence.challenge", challenge.get("competence")[0], challenge.get("id"));
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création", false);
      });
    }
  }
});

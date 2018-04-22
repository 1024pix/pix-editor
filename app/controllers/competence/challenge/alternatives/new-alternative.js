import Alternative from './alternative';

export default Alternative.extend({
  creation:true,
  mayUpdateCache:false,
  queryParams: ['from'],
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
        this.get("application").send("showMessage", "Déclinaison enregistrée", true);
        let challenge = this.get("challenge");
        this.get("parentController").send("addChallenge", challenge);
        this.transitionToRoute("competence.challenge.alternatives.alternative", this.get("competence.id"), this.get("template.id"), challenge.get("id"));
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création", false);
      });
    }
  }
});

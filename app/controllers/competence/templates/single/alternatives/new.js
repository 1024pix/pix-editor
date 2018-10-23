import Alternative from './single';

export default Alternative.extend({
  creation:true,
  mayUpdateCache:false,
  queryParams: ["from", "workbench"],
  defaultSaveChangelog:"Création de la déclinaison",
  actions:{
    cancelEdit() {
      this.set("edition", false);
      this.get("application").send("showMessage", "Création annulée", true);
      this.get("parentController").send("closeChildComponent");
    },
    save() {
      this.get("application").send("isLoading");
      let challenge = this.get("challenge");
      return this._saveChallenge()
      .then(() => {
        this.get("application").send("showMessage", "Déclinaison enregistrée", true);
        return challenge.get("skills");
      })
      .then(skills => {
        if (skills.length > 0) {
          let skill = skills.firstObject;
          return skill.reload();
        } else {
          return Promise.resolve(true);
        }
      })
      .then(() => {
        return this.get("template").getNextAlternativeVersion();
      })
      .then(version => {
        challenge.set("alternativeVersion", version);
        return challenge.save();
      })
      .then(() => {
        let version = challenge.get("alternativeVersion");
        this.get("application").send("showMessage", "Déclinaison numéro "+version, true);
        this.get("application").send("finishedLoading");
        this.transitionToRoute("competence.templates.single.alternatives.single", this.get("competence"), this.get("template"), challenge);
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création", false);
      });
    }
  }
});

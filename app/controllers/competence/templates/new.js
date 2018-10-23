import Template from './single';

export default Template.extend({
  creation:true,
  mayUpdateCache:false,
  queryParams: ['from'],
  defaultSaveChangelog:"Création du prototype",
  actions:{
    cancelEdit() {
      this.get("store").deleteRecord(this.get("challenge"));
      this.set("edition", false);
      this.get("application").send("showMessage", "Création annulée", true);
      this.get("parentController").send("closeChildComponent");
    },
    save() {
      this.get("application").send("isLoading");
      let challenge = this.get("challenge");
      return this._saveChallenge()
      .then(() => {
        this.get("application").send("showMessage", "Prototype enregistré", true);
        return challenge.get("skills")
      })
      .then(skills => {
        if (skills.length > 0) {
          let skill = skills.get("firstObject");
          return skill.reload()
          .then(() => {
            return skill.getNextVersion();
          })
        } else {
          return Promise.resolve(0);
        }
      })
      .then(version => {
        if (version>0) {
          challenge.set("version", version);
          return challenge.save();
        } else {
          return Promise.resolve(true);
        }
      })
      .then(() => {
        let version = challenge.get("version");
        if (version > 0) {
          this.get("application").send("showMessage", "Nouvelle version : "+version, true);
        }
        this.get("application").send("finishedLoading");
        this.transitionToRoute("competence.templates.single", this.get("competence"), challenge);
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création", false);
      });
    }
  }
});

import Alternative from './alternative';

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
      let skillChecks;
      if (challenge.get("skills")) {
        skillChecks = Promise.resolve(true);
      } else {
        let store = this.get("store");
        // skills need to be set
        let skillRequests = this.get("template").get("skills").reduce((current, skill) => {
          let request = store.query("workbenchSkill", {filterByFormula:"FIND('"+skill+"', {Acquis prod})"})
          .then((result) => {
            if (result.get("length")>0) {
              return result.get("firstObject").get("id");
            } else {
              let newSkill = store.createRecord("workbenchSkill", {skillId:skill, name:skill});
              return newSkill.save()
              .then(() => {
                return newSkill.get("id");
              });
            }
          });
          current.push(request);
          return current;
        }, []);
        skillChecks = Promise.all(skillRequests)
        .then(ids => {
          challenge.set("skills", ids);
        });
      }
      return skillChecks
      .then(() => {
        return this._saveChallenge();
      })
      .then(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Déclinaison enregistrée", true);
        this.get("parentController").send("addChallenge", challenge);
        this.transitionToRoute("competence.challenge.alternatives.alternative", this.get("competence.id"), this.get("template.id"), challenge.get("id"));
        this.get("parentController").send("refresh");
      }).catch(() => {
        this.get("application").send("finishedLoading");
        this.get("application").send("showMessage", "Erreur lors de la création", false);
      });
    }
  }
});

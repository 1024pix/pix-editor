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
      this._message("Création annulée");
      this.get("parentController").send("closeChildComponent");
    },
    save() {
      this.get("application").send("isLoading");
      return this._handleIllustration(this.get("challenge"))
      .then(challenge => this._handleAttachments(challenge))
      .then(challenge => this._saveChallenge(challenge))
      .then(challenge => this._setVersion(challenge))
      .then(challenge => {
        this.set("edition", false);
        this.send("minimize");
        this._message("Prototype enregistré");
        this.transitionToRoute("competence.templates.single", this.get("competence"), challenge);
      })
      .catch(() => {
        this._errorMessage("Erreur lors de la création");
      })
      .finally(() => {
        this.get("application").send("finishedLoading");
      })
    }
  },
  _setVersion(challenge) {
    return challenge.get('isWorkbench')
    .then(workbench => {
      if (workbench) {
        return challenge;
      }
      return challenge.get("firstSkill")
      .then(firstSkill => {
        if (!firstSkill) {
          return challenge;
        }
        return firstSkill.reload()
        .then(skill => skill.getNextVersion())
        .then(version => {
          if (version>0) {
            challenge.set("version", version);
            return challenge.save()
          }
          return challenge;
        });
      });
    })
    .then(challenge => {
      let version = challenge.get("version");
      if (version > 0) {
        this._message(`Nouvelle version : ${version}`, true);
      }
      return challenge;
    })
  }
});

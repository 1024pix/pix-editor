import Challenge from './challenge';

export default Challenge.extend({
  creation:true,
  actions:{
    cancelEdit() {
      this.set("edition", false);
      this.get("application").send("showMessage", "Création annulée", true);
      this.get("competence").send("closeChildComponent");
    }
  }
});

import Challenge from './challenge';

export default Challenge.extend({
  templateName: "competence/challenge",
  model(params) {
    return this.get("store").createRecord("challenge", {competence:params.competence_id, status:"proposé"});
  }
});

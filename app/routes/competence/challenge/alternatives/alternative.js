import Challenge from '../../challenge';

export default Challenge.extend({
  model(params) {
    return this.get("store").findRecord("workbenchChallenge", params.alternative_id);
  },
  templateName: "competence/challenge"
});

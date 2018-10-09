import ChallengeSerializer from './challenge';

export default ChallengeSerializer.extend({
  //TODO: remove this when field id has been removed from Production challenges table
  init() {
    this._super(...arguments);
    this.set("attrs.competence", "Competence Production");
  },
  primaryKey: 'Record ID',

});

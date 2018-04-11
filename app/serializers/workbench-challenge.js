import ChallengeSerializer from './challenge';

export default ChallengeSerializer.extend({
  //TODO: remove this when field id has been removed from Production challenges table
  primaryKey: 'Record ID',
});

import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  skill: belongsTo('skill'),
  attachments: hasMany('attachment'),
  notes: hasMany('note'),
  changelogEntries: hasMany('changelog-entry'),
  localizedChallenges: hasMany('localized-challenge'),
  challengeLocales: hasMany('challenge-locale'),
});

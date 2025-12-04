import { hasMany, belongsTo, Model } from 'miragejs';

export default Model.extend({
  tube: belongsTo('tube'),

  challenges: hasMany('challenge', { inverse: 'skill' }),
  challengesProduction: hasMany('challenge', { inverse: null }),
  localizedChallengesProduction: hasMany('localized-challenge'),

  tutoSolution: hasMany('tutorial'),

  tutoMore: hasMany('tutorial'),
});

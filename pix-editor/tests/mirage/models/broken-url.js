import { hasMany, Model } from 'miragejs';

export default Model.extend({
  skills: hasMany('skills', { inverse: null }),
  localizedChallenges: hasMany('localizedChallenges', { inverse: null }),
});

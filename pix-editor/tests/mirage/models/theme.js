import { hasMany, belongsTo, Model } from 'miragejs';

export default Model.extend({
  competence: belongsTo('competence'),
  rawTubes: hasMany('tube'),
});

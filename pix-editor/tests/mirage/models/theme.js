import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  competence: belongsTo('competence'),
  rawTubes: hasMany('tube'),
});

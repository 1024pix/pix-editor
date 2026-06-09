import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  competence: belongsTo('competence'),
  theme: belongsTo('theme'),
  rawSkills: hasMany('skill'),
});

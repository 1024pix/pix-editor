import { hasMany, belongsTo, Model } from 'miragejs';

export default Model.extend({
  competence: belongsTo('competence'),
  theme: belongsTo('theme'),
  rawSkills: hasMany('skill'),
});

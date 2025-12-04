import { hasMany, belongsTo, Model } from 'miragejs';

export default Model.extend({
  competences: hasMany('competence'),
  framework: belongsTo('framework'),
});

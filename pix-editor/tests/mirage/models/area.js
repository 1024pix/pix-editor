import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  competences: hasMany('competence'),
  framework: belongsTo('framework'),
});

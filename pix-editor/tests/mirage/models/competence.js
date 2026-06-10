import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  area: belongsTo('area'),

  rawTubes: hasMany('tube'),
  rawThemes: hasMany('theme'),
});

import { hasMany, belongsTo, Model } from 'miragejs';

export default Model.extend({
  challengeSummaries: hasMany('challenge-summary'),
  tags: hasMany('static-course-tag'),
});

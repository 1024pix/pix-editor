import { hasMany, Model } from 'miragejs';

export default Model.extend({
  challengeSummaries: hasMany('challenge-summary'),
  tags: hasMany('static-course-tag'),
});

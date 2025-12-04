import { hasMany, Model } from 'miragejs';

export default Model.extend({
  tags: hasMany('static-course-tag'),
});

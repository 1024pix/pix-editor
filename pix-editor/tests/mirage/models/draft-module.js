import { Model, belongsTo } from 'miragejs';

export default Model.extend({
  module: belongsTo('module'),
});

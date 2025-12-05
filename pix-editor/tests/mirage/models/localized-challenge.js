import { hasMany, belongsTo, Model } from 'miragejs';

export default Model.extend({
  challenge: belongsTo('challenge'),
  attachments: hasMany('attachment'),
});

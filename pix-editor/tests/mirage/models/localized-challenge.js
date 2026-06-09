import { belongsTo, hasMany, Model } from 'miragejs';

export default Model.extend({
  challenge: belongsTo('challenge'),
  attachments: hasMany('attachment'),
});

import { belongsTo, Model } from 'miragejs';

export default Model.extend({
  challenge: belongsTo('challenge'),
  localizedChallenge: belongsTo('localized-challenge'),
});

import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  name() {
    return 'Jean Admin';
  },

  access() {
    return 'admin';
  },

  trigram() {
    return 'JAD';
  },

  apiKey() {
    return 'default-valid-api-key';
  }
});


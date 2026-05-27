import { Factory } from 'miragejs';

export default Factory.extend({
  id() {
    return crypto.randomUUID();
  },

  internalTitle(i) {
    return `MOD_${i}`;
  },

  isBeta: false,
  visibility: 'public',
  level: 'novice',
});

import { Factory } from 'miragejs';

export default Factory.extend({
  id() {
    return crypto.randomUUID();
  },

  title(i) {
    return `Module ${i}`;
  },

  isBeta: false,
  visibility: 'public',
  level: 'novice',
});

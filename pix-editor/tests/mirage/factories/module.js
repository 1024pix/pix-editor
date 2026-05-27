import { Factory } from 'miragejs';

export default Factory.extend({
  id() {
    return crypto.randomUUID();
  },

  internalTitle(i) {
    return `MOD_${i}`;
  },

  title(i) {
    return `Module ${i}`;
  },

  slug(i) {
    return `module-${i}`;
  },

  details() {
    return {
      level: 'novice',
    };
  },

  sections() {
    return [
      {
        id: crypto.randomUUID(),
      },
    ];
  },

  glossary() {
    return [
      {
        word: 'pouet',
        definition: 'sound',
      },
    ];
  },

  isBeta: false,
  visibility: 'public',
});

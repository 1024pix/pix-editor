import { Factory } from 'ember-cli-mirage';

export default Factory.extend({

  name: '',
  code: '',
  competenceIds() {
    return [];
  },
  titleFrFr: '',
  titleEnUs: '',

});


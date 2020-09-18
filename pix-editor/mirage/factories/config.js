import { Factory, trait } from 'ember-cli-mirage';
import ENV from '../../tests/test-env';

export default Factory.extend({
  default: trait({
    airtableApiKey: ENV.airtableApiKey,
    airtableBase: ENV.airtableBase,
  })
});


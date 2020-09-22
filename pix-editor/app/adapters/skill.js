import AirtableAdapter from './airtable';

export default class SkillAdapter extends AirtableAdapter {

  pathForType() {
    return 'Acquis';
  }
}

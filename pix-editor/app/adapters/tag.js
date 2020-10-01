import AirtableAdapter from './airtable';

export default class TagAdapter extends AirtableAdapter {

  pathForType() {
    return 'Tags';
  }
}

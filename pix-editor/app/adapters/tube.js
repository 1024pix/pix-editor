import AirtableAdapter from './airtable';

export default class TubeAdapter extends AirtableAdapter {

  pathForType() {
    return 'Tubes';
  }
}

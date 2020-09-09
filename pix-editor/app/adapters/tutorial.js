import AirtableAdapter from './airtable';

export default class TutorialAdapter extends AirtableAdapter {

  pathForType() {
    return 'Tutoriels';
  }
}

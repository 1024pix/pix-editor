import AirtableAdapter from './airtable';

export default class ChallengeAdapter extends AirtableAdapter {

  pathForType() {
    return 'Epreuves';
  }
}

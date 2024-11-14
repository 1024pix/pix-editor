import AirtableAdapter from './airtable';

export default class TubeAdapter extends AirtableAdapter {

  fields = [
    'Record Id',
    'Nom',
    'Competences',
    'Acquis',
    'Thematique',
    'id persistant',
    'Index',
  ];

  pathForType() {
    return 'Tubes';
  }
}

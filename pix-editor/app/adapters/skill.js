import AirtableAdapter from './airtable';

export default class SkillAdapter extends AirtableAdapter {

  fields = [
    'Record Id',
    'Nom',
    'Statut de l\'indice',
    'Epreuves (id persistant)',
    'Date',
    'Description',
    'Statut de la description',
    'Comprendre',
    'En savoir plus',
    'Tube',
    'Level',
    'Status',
    'Internationalisation',
    'id persistant',
    'Version',
  ];

  urlForCreateRecord(model, snapshot) {
    if (snapshot.adapterOptions?.clone) return '/api/skills/clone';
    return super.urlForCreateRecord(model, snapshot);
  }

  pathForType() {
    return 'Acquis';
  }
}

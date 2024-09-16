import AirtableSerializer from './airtable';

export default class TubeSerializer extends AirtableSerializer {
  primaryKey = 'Record Id';

  attrs = {
    name: 'Nom',
    practicalTitleFr: 'Titre pratique fr-fr',
    practicalTitleEn: 'Titre pratique en-us',
    practicalDescriptionFr: 'Description pratique fr-fr',
    practicalDescriptionEn: 'Description pratique en-us',
    competence: 'Competences',
    rawSkills: 'Acquis',
    theme: 'Thematique',
    pixId: 'id persistant',
    index: 'Index',
  };

  payloadKeyFromModelName() {
    return 'Tubes';
  }
}

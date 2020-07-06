import ApplicationSerializer from './application';

export default class TubeSerializer extends ApplicationSerializer {
  primaryKey = 'Record Id';

  attrs = {
    name: 'Nom',
    title: 'Titre',
    description: 'Description',
    practicalTitle: 'Titre pratique',
    practicalTitleEn: 'Titre pratique en-us',
    practicalDescription: 'Description pratique',
    practicalDescriptionEn: 'Description pratique en-us',
    competence: 'Competences',
    rawSkills: 'Acquis',
    pixId: 'id persistant'
  };

  payloadKeyFromModelName() {
    return 'Tubes';
  }
}

import AirtableSerializer from './airtable';

export default class CompetenceSerializer extends AirtableSerializer {
  primaryKey = 'Record ID';

  attrs = {
    title:'Titre fr-fr',
    titleEn:'Titre en-us',
    description:'Description fr-fr',
    descriptionEn:'Description en-us',
    code:'Sous-domaine',
    rawThemes: 'Thematiques',
    rawTubes:'Sujets',
    pixId:'id persistant',
    source:'Origine',
    area: 'Domaine'
  };

  payloadKeyFromModelName() {
    return 'Competences';
  }
}

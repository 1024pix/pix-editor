import AirtableSerializer from './airtable';

export default class SillSerializer extends AirtableSerializer {

  primaryKey = 'Record Id';

  attrs = {
    name:'Nom',
    clue:'Indice fr-fr',
    clueEn:'Indice en-us',
    clueStatus:'Statut de l\'indice',
    challenges:'Epreuves',
    createdAt:'Date',
    description:'Description',
    descriptionStatus:'Statut de la description',
    tutoSolution: 'Comprendre',
    tutoMore: 'En savoir plus',
    competence:'Compétence',
    tube:'Tube',
    level:'Level',
    status:'Status',
    i18n:'Internationalisation',
    pixId:'id persistant'
  };

  payloadKeyFromModelName() {
    return 'Acquis';
  }
}

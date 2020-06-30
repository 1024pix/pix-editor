import ApplicationSerializer from './application';

export default class SillSerializer extends ApplicationSerializer {

  primaryKey = 'Record Id';

  attrs = {
    name:'Nom',
    clue:'Indice',
    clueFr:'Indice fr-fr',
    clueEn:'Indice en-us',
    clueStatus:'Statut de l\'indice',
    challenges:'Epreuves',
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

import AirtableAdapter from './airtable';

export default class TutorialAdapter extends AirtableAdapter {

  fields = [
    'Record ID',
    'Titre',
    'Durée',
    'Source',
    'Format',
    'Lien',
    'License',
    'Tags',
    'niveau',
    'Date maj',
    'CoupDeCoeur',
    'id persistant',
    'Langue',
  ];

  pathForType() {
    return 'Tutoriels';
  }
}

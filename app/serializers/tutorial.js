import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
export default class TutorialSerializer extends ApplicationSerializer {

  attrs = {
    title: 'Titre',
    duration: 'Durée',
    source: 'Source',
    format: 'Format',
    link: 'Lien',
    license: 'License',
    tags: 'Tags',
    level: 'niveau',
    date: 'Date maj',
    crush: 'CoupDeCoeur'
  };

  payloadKeyFromModelName() {
    return 'Tutoriels';
  }

}

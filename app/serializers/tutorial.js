import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
export default class TutorialSerializer extends ApplicationSerializer {

  primaryKey = 'Record ID';

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
    crush: 'CoupDeCoeur',
    pixId: 'id persistant'
  };

  payloadKeyFromModelName() {
    return 'Tutoriels';
  }

  extractAttributes() {
    let attributes = super.extractAttributes(...arguments);
    if (attributes['crush']) {
      if (attributes['crush'] === 'YES') {
        attributes['crush'] = true;
      } else {
        attributes['crush'] = false;
      }
    }
    return attributes;
  }

  serializeAttribute(snapshot, json, key) {
    if (key === 'crush') {
      let payloadKey =  this._getMappedKey(key, snapshot.type);
      let value = snapshot.attr(key);
      if (value) {
        json[payloadKey] = 'YES';
      } else {
        json[payloadKey] = '';
      }
    } else {
      return super.serializeAttribute(...arguments);
    }
  }


}

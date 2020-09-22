import AirtableSerializer from './airtable';

export default class TutorialSerializer extends AirtableSerializer {

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
    pixId: 'id persistant',
    language: 'Langue'
  };

  payloadKeyFromModelName() {
    return 'Tutoriels';
  }

  extractAttributes() {
    const attributes = super.extractAttributes(...arguments);
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
      const payloadKey =  this._getMappedKey(key, snapshot.type);
      const value = snapshot.attr(key);
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

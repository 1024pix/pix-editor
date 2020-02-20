import classic from 'ember-classic-decorator';
import ApplicationSerializer from './application';

@classic
export default class NoteSerializer extends ApplicationSerializer {
  attrs = {
    text:'Texte',
    challengeId:'Record_Id',
    author:'Auteur',
    competence:'Compétence',
    skills:'Acquis',
    production:'Production',
    changelog:'Changelog',
    createdAt:'Date',
    status:'Statut'
  };

  payloadKeyFromModelName() {
    return 'Notes';
  }

  extractAttributes() {
    let attributes = super.extractAttributes(...arguments);
    ['changelog', 'production'].forEach((key) => {
      if (attributes[key]) {
        if (attributes[key] === 'oui') {
          attributes[key] = true;
        } else {
          attributes[key] = false;
        }
      }
    });
    return attributes;
  }

  serializeAttribute(snapshot, json, key) {
    if (['changelog', 'production'].includes(key)) {
      let payloadKey =  this._getMappedKey(key, snapshot.type);
      let value = snapshot.attr(key);
      if (value) {
        json[payloadKey] = 'oui';
      } else {
        json[payloadKey] = 'non';
      }
    } else {
      return super.serializeAttribute(...arguments);
    }
  }

}

import AirtableSerializer from './airtable';

export default class NoteSerializer extends AirtableSerializer {
  primaryKey = 'Record Id';

  attrs = {
    text: 'Texte',
    recordId: 'Record_Id',
    author: 'Auteur',
    changelog: 'Changelog',
    createdAt: 'Date',
    status: 'Statut',
    elementType: 'Type d\'élément',
    skillName: 'Nom de l\'acquis',
    action: 'Action',
  };

  payloadKeyFromModelName() {
    return 'Notes';
  }

  extractAttributes() {
    const attributes = super.extractAttributes(...arguments);
    ['changelog'].forEach((key) => {
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
    if (['changelog'].includes(key)) {
      const schema = this.store.modelFor(snapshot.modelName);
      const payloadKey = this._getMappedKey(key, schema);
      const value = snapshot.attr(key);
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

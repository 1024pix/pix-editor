import AirtableSerializer from './airtable';

export default class ChallengeSerializer extends AirtableSerializer {

  primaryKey = 'Record ID';

  attrs = {
    alternativeInstructions:'Consigne alternative',
    instructions:'Consigne',
    genealogy:'Généalogie',
    skillNames:'acquis',
    type:'Type d\'épreuve',
    format:'Format',
    suggestion:'Propositions',
    answers:'Bonnes réponses',
    solutionToDisplay:'Bonnes réponses à afficher',
    t1:'T1 - Espaces, casse & accents',
    t2:'T2 - Ponctuation',
    t3:'T3 - Distance d\'édition',
    illustration:'Illustration de la consigne',
    attachments:'Pièce jointe',
    pedagogy:'Type péda',
    author:'Auteur',
    declinable:'Déclinable',
    status:'Statut',
    preview:'Preview',
    skills:'Acquix',
    pixId:'id persistant',
    scoring:'Scoring',
    timer:'Timer',
    embedURL:'Embed URL',
    embedTitle:'Embed title',
    embedHeight:'Embed height',
    version:'Version prototype',
    alternativeVersion:'Version déclinaison',
    accessibility1:'Non voyant',
    accessibility2:'Daltonien',
    spoil:'Spoil',
    responsive:'Responsive',
    alternativeText:'Texte alternatif illustration',
    languages:'Langues',
    area:'Géographie',
    autoReply: 'Réponse automatique',
    files: 'files',
  };

  payloadKeyFromModelName() {
    return 'Epreuves';
  }

  extractAttributes() {
    const attributes = super.extractAttributes(...arguments);
    ['t1', 't2', 't3'].forEach((key) => {
      if (attributes[key]) {
        if (attributes[key] === 'Activé') {
          attributes[key] = true;
        } else {
          attributes[key] = false;
        }
      }
    });
    if (attributes['attachments']) {
      attributes['attachments'] = attributes['attachments'].reverse();
    }
    return attributes;
  }

  serializeAttribute(snapshot, json, key) {
    if (['t1', 't2', 't3'].includes(key)) {
      const payloadKey =  this._getMappedKey(key, snapshot.type);
      const value = snapshot.attr(key);
      if (value) {
        json[payloadKey] = 'Activé';
      } else {
        json[payloadKey] = 'Désactivé';
      }
    } else if (key === 'attachements') {
      const payloadKey =  this._getMappedKey(key, snapshot.type);
      const value = snapshot.attr(key);
      if (value) {
        json[payloadKey] = value.reverse();
      }
    } else {
      return super.serializeAttribute(...arguments);
    }
  }
}

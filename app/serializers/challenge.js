import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
 primaryKey: 'Record ID',

  attrs:{
    instructions:"Consigne",
    genealogy:"Généalogie",
    skillNames:"acquis",
    type:"Type d'épreuve",
    format:"Format",
    suggestion:"Propositions",
    answers:"Bonnes réponses",
    t1:"T1 - Espaces, casse & accents",
    t2:"T2 - Ponctuation",
    t3:"T3 - Distance d'édition",
    illustration:"Illustration de la consigne",
    attachments:"Pièce jointe",
    pedagogy:"Type péda",
    author:"Auteur",
    declinable:"Déclinable",
    status:"Statut",
    preview:"Preview",
    competence:"Compétences (via tube)",
    skills:"Acquix",
    pixId:"id persistant",
    scoring:"Scoring",
    timer:"Timer",
    embedURL:"Embed URL",
    embedTitle:"Embed title",
    embedHeight:"Embed height",
    version:"Version prototype",
    alternativeVersion:"Version déclinaison",
    accessibility1:"Non voyant",
    accessibility2:"Daltonien",
    spoil:"Spoil",
    responsive:"Responsive",
    alternativeText:"Texte alternatif illustration",
    language:"Langue",
    area:"Géographie"
  },

  payloadKeyFromModelName: function() {
    return 'Epreuves';
  },

  extractAttributes() {
    let attributes = this._super(...arguments);
    ["t1", "t2", "t3"].forEach((key) => {
      if (attributes[key]) {
        if (attributes[key] === "Activé") {
          attributes[key] = true;
        } else {
          attributes[key] = false;
        }
      }
    });
    if (attributes["attachments"]) {
      attributes["attachments"] = attributes["attachments"].reverse();
    }
    return attributes;
  },
  serializeAttribute(snapshot, json, key) {
    if (["t1", "t2", "t3"].includes(key)) {
      let payloadKey =  this._getMappedKey(key, snapshot.type);
      let value = snapshot.attr(key);
      if (value) {
        json[payloadKey] = "Activé";
      } else {
        json[payloadKey] = "Désactivé";
      }
    } else if (key === "attachements"){
      let payloadKey =  this._getMappedKey(key, snapshot.type);
      let value = snapshot.attr(key);
      if (value) {
        json[payloadKey] = value.reverse();
      }
    } else {
      return this._super(...arguments);
    }
},
});

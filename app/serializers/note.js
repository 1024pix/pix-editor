import ApplicationSerializer from './application';

export default ApplicationSerializer.extend({
  attrs: {
    text:"Texte",
    challengeId:"Record_Id",
    author:"Auteur",
    competence:"Compétence",
    skills:"Acquis",
    production:"Production",
    changelog:"Changelog",
    createdAt:"Date"
  },
  payloadKeyFromModelName: function() {
    return 'Notes';
  },
  extractAttributes() {
    let attributes = this._super(...arguments);
    ["changelog", "production"].forEach((key) => {
      if (attributes[key]) {
        if (attributes[key] === "oui") {
          attributes[key] = true;
        } else {
          attributes[key] = false;
        }
      }
    });
    return attributes;
  },
  serializeAttribute(snapshot, json, key) {
    if (["changelog", "production"].includes(key)) {
      let payloadKey =  this._getMappedKey(key, snapshot.type);
      let value = snapshot.attr(key);
      if (value) {
        json[payloadKey] = "oui";
      } else {
        json[payloadKey] = "non";
      }
    } else {
      return this._super(...arguments);
    }
},

});

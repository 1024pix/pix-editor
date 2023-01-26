const airtable = require('../airtable');

module.exports = {
  async save(entry) {
    const airtableEntry = {
      fields: {
        'Type d\'élément': entry.elementType,
        'Changelog': 'oui',
        'Date': entry.createdAt,
        'Auteur': entry.author,
        'Record_Id': entry.recordId,
        'Texte': entry.text,
      }
    };
    await airtable.createRecord('Notes', airtableEntry, airtable.BASES.CHANGELOG);
  }
};

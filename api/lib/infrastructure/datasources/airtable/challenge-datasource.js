const datasource = require('./datasource');
const airtable = require('../../airtable');
const { ENGLISH_SPOKEN, FRENCH_FRANCE, FRENCH_SPOKEN } = require('../../../domain/constants').LOCALE;

module.exports = datasource.extend({

  modelName: 'Challenge',

  tableName: 'Epreuves',

  usedFields: [
    'id persistant',
    'Compétences (via tube) (id persistant)',
    'Timer',
    'Consigne',
    'Propositions',
    'Type d\'épreuve',
    'Bonnes réponses',
    'Bonnes réponses à afficher',
    'T1 - Espaces, casse & accents',
    'T2 - Ponctuation',
    'T3 - Distance d\'édition',
    'Scoring',
    'Statut',
    'Acquix (id persistant)',
    'acquis',
    'Embed URL',
    'Embed title',
    'Embed height',
    'Format',
    'Réponse automatique',
    'Langues',
    'Consigne alternative',
  ],

  fromAirTableObject(airtableRecord) {

    let competenceId;
    if (airtableRecord.get('Compétences (via tube) (id persistant)')) {
      competenceId = airtableRecord.get('Compétences (via tube) (id persistant)')[0];
    }

    let timer;
    if (airtableRecord.get('Timer')) {
      timer = parseInt(airtableRecord.get('Timer'));
    }

    return {
      id: airtableRecord.get('id persistant'),
      instruction: airtableRecord.get('Consigne'),
      proposals: airtableRecord.get('Propositions'),
      type: airtableRecord.get('Type d\'épreuve'),
      solution: airtableRecord.get('Bonnes réponses'),
      solutionToDisplay: airtableRecord.get('Bonnes réponses à afficher'),
      t1Status: airtableRecord.get('T1 - Espaces, casse & accents'),
      t2Status: airtableRecord.get('T2 - Ponctuation'),
      t3Status: airtableRecord.get('T3 - Distance d\'édition'),
      scoring: airtableRecord.get('Scoring'),
      status: airtableRecord.get('Statut'),
      skillIds: airtableRecord.get('Acquix (id persistant)') || [],
      skills: airtableRecord.get('acquis') || [],
      embedUrl: airtableRecord.get('Embed URL'),
      embedTitle: airtableRecord.get('Embed title'),
      embedHeight: airtableRecord.get('Embed height'),
      timer,
      competenceId,
      format: airtableRecord.get('Format') || 'mots',
      autoReply: Boolean(airtableRecord.get('Réponse automatique')) || false,
      locales: _convertLanguagesToLocales(airtableRecord.get('Langues') || []),
      alternativeInstruction: airtableRecord.get('Consigne alternative') || '',
    };
  },

  async filterById(id) {
    const airtableRawObjects = await airtable.findRecords(this.tableName, {
      filterByFormula : `{id persistant} = '${id}'`,
      maxRecords: 1,
    });
    return this.fromAirTableObject(airtableRawObjects[0]);
  }
});

function _convertLanguagesToLocales(languages) {
  return languages.map((language) => _convertLanguageToLocale(language));
}

function _convertLanguageToLocale(language) {
  switch (language) {
    case 'Anglais':
      return ENGLISH_SPOKEN;
    case 'Francophone':
      return FRENCH_SPOKEN;
    case 'Franco Français':
      return FRENCH_FRANCE;
    default:
      return FRENCH_SPOKEN;
  }
}

import { datasource } from './datasource.js';
import { findRecords } from '../../airtable.js';
import { LOCALE_TO_LANGUAGE_MAP } from '../../../domain/constants.js';
import _ from 'lodash';

export const challengeDatasource = datasource.extend({

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
    'Statut',
    'Acquix (id persistant)',
    'Embed URL',
    'Embed title',
    'Embed height',
    'Format',
    'files',
    'Réponse automatique',
    'Langues',
    'Consigne alternative',
    'Focalisée',
    'Record ID',
    'Acquix',
    'Généalogie',
    'Type péda',
    'Auteur',
    'Déclinable',
    'Preview',
    'Version prototype',
    'Version déclinaison',
    'Non voyant',
    'Daltonien',
    'Spoil',
    'Responsive',
    'Géographie',
    'Difficulté calculée',
    'Discrimination calculée',
    'updated_at',
    'created_at',
    'validated_at',
    'archived_at',
    'made_obsolete_at',
    'shuffled',
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
      t1Status: _convertAirtableValueToBoolean(airtableRecord.get('T1 - Espaces, casse & accents')),
      t2Status: _convertAirtableValueToBoolean(airtableRecord.get('T2 - Ponctuation')),
      t3Status: _convertAirtableValueToBoolean(airtableRecord.get('T3 - Distance d\'édition')),
      status: airtableRecord.get('Statut'),
      skills: airtableRecord.get('Acquix') || [],
      skillId: (airtableRecord.get('Acquix (id persistant)') || [])[0],
      embedUrl: airtableRecord.get('Embed URL'),
      embedTitle: airtableRecord.get('Embed title'),
      embedHeight: airtableRecord.get('Embed height'),
      timer,
      competenceId,
      format: airtableRecord.get('Format') || 'mots',
      files: airtableRecord.get('files'),
      autoReply: Boolean(airtableRecord.get('Réponse automatique')) || false,
      locales: _convertLanguagesToLocales(airtableRecord.get('Langues') || []),
      alternativeInstruction: airtableRecord.get('Consigne alternative') || '',
      focusable: airtableRecord.get('Focalisée'),
      airtableId: airtableRecord.get('Record ID'),
      genealogy: airtableRecord.get('Généalogie'),
      pedagogy: airtableRecord.get('Type péda'),
      author: airtableRecord.get('Auteur'),
      declinable: airtableRecord.get('Déclinable'),
      preview: airtableRecord.get('Preview'),
      version: airtableRecord.get('Version prototype'),
      alternativeVersion: airtableRecord.get('Version déclinaison'),
      accessibility1: airtableRecord.get('Non voyant'),
      accessibility2: airtableRecord.get('Daltonien'),
      spoil: airtableRecord.get('Spoil'),
      responsive: airtableRecord.get('Responsive'),
      area: airtableRecord.get('Géographie'),
      delta: parseFloat(airtableRecord.get('Difficulté calculée')),
      alpha: parseFloat(airtableRecord.get('Discrimination calculée')),
      updatedAt: airtableRecord.get('updated_at'),
      validatedAt: airtableRecord.get('validated_at'),
      archivedAt: airtableRecord.get('archived_at'),
      madeObsoleteAt: airtableRecord.get('made_obsolete_at'),
      createdAt: airtableRecord.get('created_at'),
      shuffled: airtableRecord.get('shuffled'),
    };
  },

  toAirTableObject(model) {
    const body = {
      fields: {
        'id persistant': model.id,
        'Consigne': model.instruction,
        'Propositions': model.proposals,
        'Type d\'épreuve': model.type,
        'Bonnes réponses': model.solution,
        'Bonnes réponses à afficher': model.solutionToDisplay,
        'T1 - Espaces, casse & accents': _convertBooleanToAirtableValue(model.t1Status),
        'T2 - Ponctuation': _convertBooleanToAirtableValue(model.t2Status),
        'T3 - Distance d\'édition': _convertBooleanToAirtableValue(model.t3Status),
        'Statut': model.status,
        'Embed URL': model.embedUrl,
        'Embed title': model.embedTitle,
        'Embed height': model.embedHeight,
        'Timer': model.timer,
        'Format': model.format,
        'Réponse automatique': model.autoReply,
        'Langues': _convertLocalesToLanguages(model.locales),
        'Consigne alternative': model.alternativeInstruction,
        'Focalisée': model.focusable,
        'Acquix': model.skills,
        'Généalogie': model.genealogy,
        'Type péda': model.pedagogy,
        'Auteur': model.author,
        'Déclinable': model.declinable,
        'Version prototype': model.version,
        'Version déclinaison': model.alternativeVersion,
        'Non voyant': model.accessibility1,
        'Daltonien': model.accessibility2,
        'Spoil': model.spoil,
        'Responsive': model.responsive,
        'Géographie': model.area,
        'files': model.files,
        'validated_at': model.validatedAt,
        'archived_at': model.archivedAt,
        'made_obsolete_at': model.madeObsoleteAt,
        'shuffled': model.shuffled,
      }
    };
    if (model.airtableId) {
      body.id = model.airtableId;
    }
    return body;
  },

  async search(params) {
    const options = {
      fields: this.usedFields,
      filterByFormula : `AND(FIND('${_escapeQuery(params.filter.search)}', LOWER(CONCATENATE(Consigne,Propositions,{Embed URL}))) , Statut != 'archive')`
    };
    if (params.page && params.page.size) {
      options.maxRecords = params.page.size;
    }
    const airtableRawObjects = await findRecords(this.tableName, options);
    return airtableRawObjects.map(this.fromAirTableObject);
  },

  async filterById(id) {
    const airtableRawObjects = await findRecords(this.tableName, {
      filterByFormula : `{id persistant} = '${id}'`,
      maxRecords: 1,
    });
    return this.fromAirTableObject(airtableRawObjects[0]);
  },

  async getAllIdsIn(challengeIds) {
    const options = {
      fields: ['id persistant'],
      filterByFormula: 'OR(' + challengeIds.map((id) => `'${id}' = {id persistant}`).join(',') + ')'
    };
    const airtableRawObjects = await findRecords(this.tableName, options);
    return airtableRawObjects.map((airtableRawObject) => airtableRawObject.get('id persistant'));
  }
});

function _escapeQuery(value) {
  return value.replace(/'/g, '\\\'');
}

function _convertBooleanToAirtableValue(value) {
  if (value) {
    return 'Activé';
  }
  return 'Désactivé';
}

function _convertAirtableValueToBoolean(value) {
  return value === 'Activé';
}

function _convertLanguagesToLocales(languages) {
  return languages.map((language) => _convertLanguageToLocale(language));
}

function _convertLanguageToLocale(language) {
  const locale = _.findKey(LOCALE_TO_LANGUAGE_MAP, (lang) => language === lang);
  if (!locale) {
    throw new Error('Langue inconnue');
  }

  return locale;
}

function _convertLocalesToLanguages(locales) {
  return locales.map((locale) => _convertLocaleToLanguage(locale));
}

function _convertLocaleToLanguage(locale) {
  const language = LOCALE_TO_LANGUAGE_MAP[locale];
  if (!language) {
    throw new Error('Locale inconnue');
  }

  return language;
}

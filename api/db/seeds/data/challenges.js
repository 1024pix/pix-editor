import {
  pickNRandomValueInArr,
  pickNRandomValuesInObj,
  pickRandomBoolean,
  pickRandomValueInArr,
  pickRandomValueInObj,
  saveInAirtable
} from './utils.js';
import { Challenge, LocalizedChallenge } from '../../../lib/domain/models/index.js';
import { fields } from '../../../lib/infrastructure/translations/challenge.js';
import { challengeDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';

// 1 proto et des déclis par acquis hors workbench
export async function buildChallenges({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const challengeData = [];
  for (let i = 0; i < learningContentConfig.countFrameworks; ++i) {
    for (let j = 0; j < learningContentConfig.countAreasPerFramework; ++j) {
      for (let k = 0; k < learningContentConfig.countCompetencesPerArea; ++k) {
        for (let l = 0; l < learningContentConfig.countThematicsPerCompetence; ++l) {
          for (let m = 0; m < learningContentConfig.countTubesPerThematic; ++m) {
            const currentTubeItem = learningContentData[i].areas[j].competences[k].thematics[l].tubes[m];
            for (const currentSkillItem of currentTubeItem.skills) {
              const idPart = currentSkillItem.id.split('skill')[1];
              const baseChallengeId = `challenge${idPart}Ch`;
              if (currentSkillItem.status === 'en construction') {
                const challenges = buildChallengesForEnConstructionSkill(currentSkillItem, baseChallengeId, learningContentConfig.locales, databaseBuilder);
                challengeData.push(...challenges);
                currentSkillItem.challenges.push(...challenges);
              }
              if (currentSkillItem.status === 'actif') {
                const challenges = buildChallengesForActiveSkill(currentSkillItem, baseChallengeId, learningContentConfig.locales, databaseBuilder);
                challengeData.push(...challenges);
                currentSkillItem.challenges.push(...challenges);
              }
              if (currentSkillItem.status === 'archivé') {
                const challenges = buildChallengesForArchivedSkill(currentSkillItem, baseChallengeId, learningContentConfig.locales, databaseBuilder);
                challengeData.push(...challenges);
                currentSkillItem.challenges.push(...challenges);
              }
              if (currentSkillItem.status === 'périmé') {
                const challenges = buildChallengesForObsoleteSkill(currentSkillItem, baseChallengeId, learningContentConfig.locales, databaseBuilder);
                challengeData.push(...challenges);
                currentSkillItem.challenges.push(...challenges);
              }
            }
          }
        }
      }
    }
  }
  const airtableData = challengeData.map(challengeDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Epreuves', data: airtableData, logger, airtableClient });
  challengeData.forEach((challengeItem) => {
    challengeItem.airtableId = records.shift().id;
  });
}

function buildChallengesForEnConstructionSkill(currentSkillItem, baseChallengeId, locales, databaseBuilder) {
  const challenges = [];
  let i = 1;
  const challengeProto = {
    ...generateBaseChallengeData(Challenge.STATUSES.PROPOSE),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.PROPOSE,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.PROTOTYPE,
    version: currentSkillItem.version,
    alternativeVersion: null,
  };
  addPrimaryLocalizedChallenge(challengeProto, databaseBuilder);
  challenges.push(challengeProto);
  ++i;
  const challengeDecli1 = {
    ...generateBaseChallengeData(Challenge.STATUSES.PROPOSE),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.PROPOSE,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli1, databaseBuilder);
  challenges.push(challengeDecli1);
  ++i;
  const challengeDecli2 = {
    ...generateBaseChallengeData(Challenge.STATUSES.PERIME),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.PERIME,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli2, databaseBuilder);
  challenges.push(challengeDecli2);
  return challenges;
}

function buildChallengesForActiveSkill(currentSkillItem, baseChallengeId, locales, databaseBuilder) {
  const challenges = [];
  let i = 1;
  const challengeProto = {
    ...generateBaseChallengeData(Challenge.STATUSES.VALIDE),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.VALIDE,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.PROTOTYPE,
    version: currentSkillItem.version,
    alternativeVersion: null,
  };
  addPrimaryLocalizedChallenge(challengeProto, databaseBuilder);
  let translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeProto, translatedLocales[0], LocalizedChallenge.STATUSES.PLAY, databaseBuilder);
  addTranslationFor(challengeProto, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeProto);
  ++i;
  const challengeDecli1 = {
    ...generateBaseChallengeData(Challenge.STATUSES.VALIDE),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.VALIDE,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli1, databaseBuilder);
  translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeDecli1, translatedLocales[0], LocalizedChallenge.STATUSES.PLAY, databaseBuilder);
  addTranslationFor(challengeDecli1, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeDecli1);
  ++i;
  const challengeDecli2 = {
    ...generateBaseChallengeData(Challenge.STATUSES.PERIME),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.PERIME,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli2, databaseBuilder);
  translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeDecli2, translatedLocales[0], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  addTranslationFor(challengeDecli2, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeDecli2);
  ++i;
  const challengeDecli3 = {
    ...generateBaseChallengeData(Challenge.STATUSES.ARCHIVE),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.ARCHIVE,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli3, databaseBuilder);
  translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeDecli3, translatedLocales[0], LocalizedChallenge.STATUSES.PLAY, databaseBuilder);
  addTranslationFor(challengeDecli3, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeDecli3);
  return challenges;
}

function buildChallengesForArchivedSkill(currentSkillItem, baseChallengeId, locales, databaseBuilder) {
  const challenges = [];
  let i = 1;
  const challengeProto = {
    ...generateBaseChallengeData(Challenge.STATUSES.ARCHIVE),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.ARCHIVE,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.PROTOTYPE,
    version: currentSkillItem.version,
    alternativeVersion: null,
  };
  addPrimaryLocalizedChallenge(challengeProto, databaseBuilder);
  let translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeProto, translatedLocales[0], LocalizedChallenge.STATUSES.PLAY, databaseBuilder);
  addTranslationFor(challengeProto, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeProto);
  ++i;
  const challengeDecli1 = {
    ...generateBaseChallengeData(Challenge.STATUSES.ARCHIVE),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.ARCHIVE,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli1, databaseBuilder);
  translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeDecli1, translatedLocales[0], LocalizedChallenge.STATUSES.PLAY, databaseBuilder);
  addTranslationFor(challengeDecli1, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeDecli1);
  ++i;
  const challengeDecli2 = {
    ...generateBaseChallengeData(Challenge.STATUSES.PERIME),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.PERIME,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli2, databaseBuilder);
  translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeDecli2, translatedLocales[0], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  addTranslationFor(challengeDecli2, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeDecli2);
  return challenges;
}

function buildChallengesForObsoleteSkill(currentSkillItem, baseChallengeId, locales, databaseBuilder) {
  const challenges = [];
  let i = 1;
  const challengeProto = {
    ...generateBaseChallengeData(Challenge.STATUSES.PERIME),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.PERIME,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.PROTOTYPE,
    version: currentSkillItem.version,
    alternativeVersion: null,
  };
  addPrimaryLocalizedChallenge(challengeProto, databaseBuilder);
  let translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeProto, translatedLocales[0], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  addTranslationFor(challengeProto, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeProto);
  ++i;
  const challengeDecli1 = {
    ...generateBaseChallengeData(Challenge.STATUSES.PERIME),
    id: `${baseChallengeId}${i}`,
    status: Challenge.STATUSES.PERIME,
    skills: [currentSkillItem.airtableId],
    skillId: currentSkillItem.id,
    locales: [locales[0]],
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    version: currentSkillItem.version,
    alternativeVersion: i - 1,
  };
  addPrimaryLocalizedChallenge(challengeDecli1, databaseBuilder);
  translatedLocales = pickNRandomValueInArr(locales.filter((loc) => loc !== 'fr'), 2);
  addTranslationFor(challengeDecli1, translatedLocales[0], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  addTranslationFor(challengeDecli1, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  challenges.push(challengeDecli1);
  return challenges;
}

function generateBaseChallengeData(status) {
  let updatedAt, validatedAt, archivedAt, madeObsoleteAt, createdAt;
  if (status === Challenge.STATUSES.PROPOSE) {
    createdAt = new Date('2024-01-01');
    updatedAt = new Date('2024-02-02');
    validatedAt = null;
    archivedAt = null;
    madeObsoleteAt = null;
  }
  if (status === Challenge.STATUSES.VALIDE) {
    createdAt = new Date('2023-01-01');
    updatedAt = new Date('2023-03-03');
    validatedAt = new Date('2023-03-03');
    archivedAt = null;
    madeObsoleteAt = null;
  }
  if (status === Challenge.STATUSES.ARCHIVE) {
    createdAt = new Date('2022-01-01');
    updatedAt = new Date('2022-04-04');
    validatedAt = new Date('2022-03-03');
    archivedAt = new Date('2022-04-04');
    madeObsoleteAt = null;
  }
  if (status === Challenge.STATUSES.PERIME) {
    createdAt = new Date('2021-01-01');
    updatedAt = new Date('2021-05-05');
    validatedAt = null;
    archivedAt = null;
    madeObsoleteAt = new Date('2021-05-05');
  }
  return {
    accessibility1: pickRandomValueInObj(Challenge.ACCESSIBILITY1),
    accessibility2: pickRandomValueInObj(Challenge.ACCESSIBILITY2),
    alpha: pickRandomValueInArr([...Array(5).keys(), null]),
    author: ['DEV'],
    autoReply: pickRandomBoolean(),
    contextualizedFields: pickNRandomValuesInObj(Challenge.CONTEXTUALIZED_FIELDS, 2),
    declinable: pickRandomValueInObj(Challenge.DECLINABLES),
    delta: pickRandomValueInArr([...Array(5).keys(), null]),
    files: [],
    focusable: pickRandomBoolean(),
    format: pickRandomValueInObj(Challenge.FORMATS),
    geography: 'Monde',
    pedagogy: pickRandomValueInObj(Challenge.PEDAGOGIES),
    responsive: pickRandomValueInObj(Challenge.RESPONSIVES),
    shuffled: pickRandomBoolean(),
    spoil: pickRandomValueInObj(Challenge.SPOILS),
    t1Status: pickRandomBoolean(),
    t2Status: pickRandomBoolean(),
    t3Status: pickRandomBoolean(),
    timer: pickRandomValueInArr([30, 120, 180, null]),
    type: pickRandomValueInObj(Challenge.TYPES),
    createdAt,
    updatedAt,
    validatedAt,
    archivedAt,
    madeObsoleteAt,
  };
}

function addPrimaryLocalizedChallenge(challengeData, databaseBuilder) {
  databaseBuilder.factory.buildLocalizedChallenge({
    id: challengeData.id,
    challengeId: challengeData.id,
    locale: challengeData.locales[0],
    status: null,
    ...generateBaseLocalizedChallengeData(),
  });
  for (const translatableField of fields) {
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeData.id}.${translatableField}`,
      locale: challengeData.locales[0],
      value: `value ${challengeData.locales[0]} for ${translatableField}`,
    });
  }
}

function addTranslationFor(challengeData, locale, status, databaseBuilder) {
  databaseBuilder.factory.buildLocalizedChallenge({
    id: `${challengeData.id}${locale.toUpperCase()}`,
    challengeId: challengeData.id,
    locale: locale,
    status,
    ...generateBaseLocalizedChallengeData(),
  });
  for (const translatableField of fields) {
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeData.id}.${translatableField}`,
      locale: locale,
      value: `value ${locale} for ${translatableField}`,
    });
  }
}

function generateBaseLocalizedChallengeData() {
  return {
    embedUrl: null,
    requireGafamWebsiteAccess: pickRandomBoolean(),
    isIncompatibleIpadCertif: pickRandomBoolean(),
    isAwarenessChallenge: pickRandomBoolean(),
    toRephrase: pickRandomBoolean(),
    deafAndHardOfHearing: pickRandomValueInObj(LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES),
    geography: 'VN',
    urlsToConsult: null,
  };
}

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

export async function buildChallengesFromConfig({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  const challengeItems = [];
  for (const frameworkItem of learningContentData) {
    for (const areaItem of frameworkItem.areas) {
      for (const competenceItem of areaItem.competences) {
        for (const thematicItem of competenceItem.thematics) {
          for (const tubeItem of thematicItem.tubes) {
            for (const skillItem of tubeItem.skills) {
              let challenges;
              if (skillItem.status === 'en construction') {
                challenges = buildChallengesForEnConstructionSkill(skillItem, learningContentConfig.locales, databaseBuilder);
              }
              if (skillItem.status === 'actif') {
                challenges = buildChallengesForActiveSkill(skillItem, learningContentConfig.locales, databaseBuilder);
              }
              if (skillItem.status === 'archivé') {
                challenges = buildChallengesForArchivedSkill(skillItem, learningContentConfig.locales, databaseBuilder);
              }
              if (skillItem.status === 'périmé') {
                challenges = buildChallengesForObsoleteSkill(skillItem, learningContentConfig.locales, databaseBuilder);
              }
              challengeItems.push(...challenges);
              skillItem.challenges.push(...challenges);
            }
          }
        }
      }
    }
  }
  await persistChallenges({ items: challengeItems, airtableClient, logger });
}

export function buildChallenge({ indexChallenge, skillItem, status, isProto, protoVersion, decliVersion, databaseBuilder, locales }) {
  const partId = skillItem.id.split('skill')[1];
  const challengeId = `challenge${partId}Ch${indexChallenge}`;
  const challengeItem = {
    ...generateBaseChallengeData(status),
    id: challengeId,
    status: status,
    skills: [skillItem.airtableId],
    skillId: skillItem.id,
    locales: [locales[0]],
    genealogy: isProto ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON,
    version: protoVersion,
    alternativeVersion: decliVersion,
  };
  addPrimaryLocalizedChallenge(challengeItem, databaseBuilder);
  if (status !== Challenge.STATUSES.PROPOSE) {
    const translatedLocales = pickNRandomValueInArr(locales.slice(1), 2);
    const statusForTranslation1 = status === Challenge.STATUSES.VALIDE ? LocalizedChallenge.STATUSES.PLAY : LocalizedChallenge.STATUSES.PAUSE;
    addTranslationFor(challengeItem, translatedLocales[0], statusForTranslation1, databaseBuilder);
    addTranslationFor(challengeItem, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder);
  }
  return challengeItem;
}

export async function persistChallenges({ items, airtableClient, logger }) {
  const airtableItems = items.map(challengeDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Epreuves', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    item.airtableId = records.shift().id;
  });
}

function buildChallengesForEnConstructionSkill(skillItem, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.PROPOSE, isProto: true, protoVersion: skillItem.version, decliVersion: null, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.PROPOSE, isProto: false, protoVersion: skillItem.version, decliVersion: 1, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 2, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 2, databaseBuilder, locales }));
  return challenges;
}

function buildChallengesForActiveSkill(skillItem, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.VALIDE, isProto: true, protoVersion: skillItem.version, decliVersion: null, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.VALIDE, isProto: false, protoVersion: skillItem.version, decliVersion: 1, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 2, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 2, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 3, skillItem, status: Challenge.STATUSES.ARCHIVE, isProto: false, protoVersion: skillItem.version, decliVersion: 3, databaseBuilder, locales }));
  return challenges;
}

function buildChallengesForArchivedSkill(skillItem, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.ARCHIVE, isProto: true, protoVersion: skillItem.version, decliVersion: null, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.ARCHIVE, isProto: false, protoVersion: skillItem.version, decliVersion: 1, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 2, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 2, databaseBuilder, locales }));
  return challenges;
}

function buildChallengesForObsoleteSkill(skillItem, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.PERIME, isProto: true, protoVersion: skillItem.version, decliVersion: null, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 1, databaseBuilder, locales }));
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

import { cycle, saveInAirtable, } from './utils.js';
import { Challenge, LocalizedChallenge } from '../../../lib/domain/models/index.js';
import { fields } from '../../../lib/infrastructure/translations/challenge.js';
import { challengeDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { buildAttachment, persistAttachments } from './attachments.js';

const ignoreEmptyValues = (val) => Boolean(val);

const iterFor = {
  'accessibility1': cycle(Object.values(Challenge.ACCESSIBILITY1).filter(ignoreEmptyValues)),
  'accessibility2': cycle(Object.values(Challenge.ACCESSIBILITY2).filter(ignoreEmptyValues)),
  'declinable': cycle(Object.values(Challenge.DECLINABLES).filter(ignoreEmptyValues)),
  'format': cycle(Object.values(Challenge.FORMATS).filter(ignoreEmptyValues)),
  'pedagogy': cycle(Object.values(Challenge.PEDAGOGIES).filter(ignoreEmptyValues)),
  'responsive': cycle(Object.values(Challenge.RESPONSIVES).filter(ignoreEmptyValues)),
  'spoil': cycle(Object.values(Challenge.SPOILS).filter(ignoreEmptyValues)),
  'type': cycle(Object.values(Challenge.TYPES).filter(ignoreEmptyValues)),
  'deafAndHardOfHearing': cycle(Object.values(LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES).filter(ignoreEmptyValues)),
  'alpha': cycle([...Array(5).keys(), null]),
  'delta': cycle([...Array(5).keys(), null]),
  'timer': cycle([30, 120, 180, null]),
  'autoReply': cycle([true, false]),
  'shuffled': cycle([true, false]),
  'focusable': cycle([true, false]),
  't1Status': cycle([true, false]),
  't2Status': cycle([true, false]),
  't3Status': cycle([true, false]),
  'toRephrase': cycle([true, false]),
  'isAwarenessChallenge': cycle([true, false]),
  'isIncompatibleIpadCertif': cycle([true, false]),
  'requireGafamWebsiteAccess': cycle([true, false]),
  'contextualizedFields': cycle(Object.values(Challenge.CONTEXTUALIZED_FIELDS).filter(ignoreEmptyValues)),
  'attachmentType': cycle(['attachment', 'illustration']),
};

let iterLocale;
export async function buildChallengesFromConfig({
  airtableClient,
  databaseBuilder,
  logger,
  learningContentConfig,
  learningContentData,
}) {
  iterLocale = cycle(learningContentConfig.locales.slice(1));
  const challengeItems = [];
  const allTubes = learningContentData.flatMap((framework) => framework.areas.flatMap((area) => area.competences).flatMap((competence) => competence.thematics.flatMap((thematic) => thematic.tubes)));
  const allSkills = allTubes.flatMap((tube) => tube.skills);
  for (const skillItem of allSkills) {
    const tubeIndex = allTubes.findIndex(({ airtableId }) => skillItem.tubeAirtableId === airtableId);
    const shouldAddAttachment = tubeIndex % 4 === 0;
    const typeForAttachment = iterFor['attachmentType'].next().value;
    let challenges;
    if (skillItem.status === 'en construction') {
      challenges = buildChallengesForEnConstructionSkill(skillItem, shouldAddAttachment, typeForAttachment, learningContentConfig.locales, databaseBuilder);
    }
    if (skillItem.status === 'actif') {
      challenges = buildChallengesForActiveSkill(skillItem, shouldAddAttachment, typeForAttachment, learningContentConfig.locales, databaseBuilder);
    }
    if (skillItem.status === 'archivé') {
      challenges = buildChallengesForArchivedSkill(skillItem, shouldAddAttachment, typeForAttachment, learningContentConfig.locales, databaseBuilder);
    }
    if (skillItem.status === 'périmé') {
      challenges = buildChallengesForObsoleteSkill(skillItem, shouldAddAttachment, typeForAttachment, learningContentConfig.locales, databaseBuilder);
    }
    challengeItems.push(...challenges);
    skillItem.challenges.push(...challenges);
  }
  await persistChallenges({ items: challengeItems, airtableClient, logger });
  const allAttachments = challengeItems.flatMap((challengeItem) => challengeItem.attachments);
  await persistAttachments({ items: allAttachments, airtableClient, logger, databaseBuilder });
}

export function buildChallenge({ indexChallenge, skillItem, status, isProto, protoVersion, decliVersion, shouldAddAttachment = false, typeForAttachment, databaseBuilder, locales }) {
  const partId = skillItem.id.split('skill')[1];
  const challengeId = `challenge${partId}Ch${indexChallenge}`;
  const attachments = [];
  if (shouldAddAttachment) {
    attachments.push(buildAttachment({ challengeId, localizedChallengeId: challengeId, type: typeForAttachment, databaseBuilder, locale: locales[0] }));
  }
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
  if (status !== Challenge.STATUSES.PROPOSE && locales.length > 1) {
    const translatedLocales = [iterLocale.next().value, iterLocale.next().value];
    const statusForTranslation1 = status === Challenge.STATUSES.VALIDE ? LocalizedChallenge.STATUSES.PLAY : LocalizedChallenge.STATUSES.PAUSE;
    addTranslationFor(challengeItem, translatedLocales[0], statusForTranslation1, databaseBuilder, shouldAddAttachment, typeForAttachment, attachments);
    if (translatedLocales[0] !== translatedLocales[1]) {
      addTranslationFor(challengeItem, translatedLocales[1], LocalizedChallenge.STATUSES.PAUSE, databaseBuilder, shouldAddAttachment, typeForAttachment, attachments);
    }
  }
  challengeItem.attachments = attachments;
  return challengeItem;
}

export async function persistChallenges({ items, airtableClient, logger }) {
  const airtableItems = items.map(challengeDatasource.toAirTableObject);
  const records = await saveInAirtable({ tableName: 'Epreuves', data: airtableItems, logger, airtableClient });
  items.forEach((item) => {
    const airtableId = records.shift().id;
    item.airtableId = airtableId;
    item.attachments.forEach((att) => {
      att.challengeAirtableId = airtableId;
    });
  });
}

function buildChallengesForEnConstructionSkill(skillItem, shouldAddAttachment, typeForAttachment, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.PROPOSE, isProto: true, protoVersion: skillItem.version, decliVersion: null, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.PROPOSE, isProto: false, protoVersion: skillItem.version, decliVersion: 1, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 2, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 2, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  return challenges;
}

function buildChallengesForActiveSkill(skillItem, shouldAddAttachment, typeForAttachment, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.VALIDE, isProto: true, protoVersion: skillItem.version, decliVersion: null, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.VALIDE, isProto: false, protoVersion: skillItem.version, decliVersion: 1, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 2, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 2, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 3, skillItem, status: Challenge.STATUSES.ARCHIVE, isProto: false, protoVersion: skillItem.version, decliVersion: 3, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  return challenges;
}

function buildChallengesForArchivedSkill(skillItem, shouldAddAttachment, typeForAttachment, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.ARCHIVE, isProto: true, protoVersion: skillItem.version, decliVersion: null, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.ARCHIVE, isProto: false, protoVersion: skillItem.version, decliVersion: 1, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 2, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 2, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  return challenges;
}

function buildChallengesForObsoleteSkill(skillItem, shouldAddAttachment, typeForAttachment, locales, databaseBuilder) {
  const challenges = [];
  challenges.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.PERIME, isProto: true, protoVersion: skillItem.version, decliVersion: null, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
  challenges.push(buildChallenge({ indexChallenge: 1, skillItem, status: Challenge.STATUSES.PERIME, isProto: false, protoVersion: skillItem.version, decliVersion: 1, shouldAddAttachment, typeForAttachment, databaseBuilder, locales }));
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
    accessibility1: iterFor.accessibility1.next().value,
    accessibility2: iterFor.accessibility2.next().value,
    alpha: iterFor.alpha.next().value,
    author: ['DEV'],
    autoReply: iterFor.autoReply.next().value,
    contextualizedFields: [iterFor.contextualizedFields.next().value, iterFor.contextualizedFields.next().value],
    declinable: iterFor.declinable.next().value,
    delta: iterFor.delta.next().value,
    files: [],
    focusable: iterFor.focusable.next().value,
    format: iterFor.format.next().value,
    geography: 'Monde',
    pedagogy: iterFor.pedagogy.next().value,
    responsive: iterFor.responsive.next().value,
    shuffled: iterFor.shuffled.next().value,
    spoil: iterFor.spoil.next().value,
    t1Status: iterFor.t1Status.next().value,
    t2Status: iterFor.t2Status.next().value,
    t3Status: iterFor.t3Status.next().value,
    timer: iterFor.timer.next().value,
    type: iterFor.type.next().value,
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
  for (const translatableField of fields.filter((field) => field !== 'illustrationAlt')) {
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeData.id}.${translatableField}`,
      locale: challengeData.locales[0],
      value: `value ${challengeData.locales[0]} for ${translatableField}`,
    });
  }
}

function addTranslationFor(challengeData, locale, status, databaseBuilder, shouldAddAttachment, typeForAttachment, attachments) {
  const localizedChallengeId = `${challengeData.id}${locale.toUpperCase()}`;
  if (shouldAddAttachment) {
    attachments.push(buildAttachment({ challengeId: challengeData.id, localizedChallengeId, type: typeForAttachment, databaseBuilder, locale }));
  }
  databaseBuilder.factory.buildLocalizedChallenge({
    id: localizedChallengeId,
    challengeId: challengeData.id,
    locale: locale,
    status,
    ...generateBaseLocalizedChallengeData(),
  });
  for (const translatableField of fields.filter((field) => field !== 'illustrationAlt')) {
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
    requireGafamWebsiteAccess: iterFor.requireGafamWebsiteAccess.next().value,
    isIncompatibleIpadCertif: iterFor.isIncompatibleIpadCertif.next().value,
    isAwarenessChallenge: iterFor.isAwarenessChallenge.next().value,
    toRephrase: iterFor.toRephrase.next().value,
    deafAndHardOfHearing: iterFor.deafAndHardOfHearing.next().value,
    geography: 'VN',
    urlsToConsult: null,
  };
}

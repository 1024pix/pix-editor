import { cycle, saveInAirtable } from './utils.js';
import { Challenge, LocalizedChallenge } from '../../../lib/domain/models/index.js';
import { fields } from '../../../lib/infrastructure/translations/challenge.js';
import { challengeDatasource } from '../../../lib/infrastructure/datasources/airtable/index.js';
import { buildAttachment, persistAttachments } from './attachments.js';
import { convertLanguagesToLocales } from '../../../lib/domain/services/convert-locales.js';

const ignoreEmptyValues = (val) => Boolean(val);

const iterFor = {
  accessibility1: cycle(Object.values(Challenge.ACCESSIBILITY1).filter(ignoreEmptyValues)),
  accessibility2: cycle(Object.values(Challenge.ACCESSIBILITY2).filter(ignoreEmptyValues)),
  declinable: cycle(Object.values(Challenge.DECLINABLES).filter(ignoreEmptyValues)),
  format: cycle(Object.values(Challenge.FORMATS).filter(ignoreEmptyValues)),
  pedagogy: cycle(Object.values(Challenge.PEDAGOGIES).filter(ignoreEmptyValues)),
  responsive: cycle(Object.values(Challenge.RESPONSIVES).filter(ignoreEmptyValues)),
  spoil: cycle(Object.values(Challenge.SPOILS).filter(ignoreEmptyValues)),
  type: cycle(
    Object.values(Challenge.TYPES)
      .filter(ignoreEmptyValues)
      .filter((type) => ![Challenge.TYPES.QROCM, Challenge.TYPES.QMAIL].includes(type)),
  ),
  deafAndHardOfHearing: cycle(
    Object.values(LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES).filter(ignoreEmptyValues),
  ),
  alpha: cycle([...Array(5).keys(), null]),
  delta: cycle([...Array(5).keys(), null]),
  timer: cycle([30, 120, 180, null]),
  autoReply: cycle([true, false]),
  shuffled: cycle([true, false]),
  focusable: cycle([true, false]),
  t1Status: cycle([true, false]),
  t2Status: cycle([true, false]),
  t3Status: cycle([true, false]),
  toRephrase: cycle([true, false]),
  isAwarenessChallenge: cycle([true, false]),
  isIncompatibleIpadCertif: cycle([true, false]),
  requireGafamWebsiteAccess: cycle([true, false]),
  contextualizedFields: cycle(Object.values(Challenge.CONTEXTUALIZED_FIELDS).filter(ignoreEmptyValues)),
  attachmentType: cycle(['attachment', 'illustration']),
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
  const allTubes = learningContentData.flatMap((framework) =>
    framework.areas
      .flatMap((area) => area.competences)
      .flatMap((competence) => competence.thematics.flatMap((thematic) => thematic.tubes)),
  );
  const allSkills = allTubes.flatMap((tube) => tube.skills);
  for (const skillItem of allSkills) {
    const tubeIndex = allTubes.findIndex(({ airtableId }) => skillItem.tubeAirtableId === airtableId);
    const shouldAddAttachment = tubeIndex % 4 === 0;
    const typeForAttachment = iterFor['attachmentType'].next().value;
    let challenges;
    let autoReply = false;
    const type = iterFor.type.next().value;
    if (type === Challenge.TYPES.QROC) {
      autoReply = iterFor.autoReply.next().value;
    }
    if (skillItem.status === 'en construction') {
      challenges = buildChallengesForEnConstructionSkill(
        skillItem,
        type,
        autoReply,
        shouldAddAttachment,
        typeForAttachment,
        learningContentConfig.locales,
        databaseBuilder,
      );
    }
    if (skillItem.status === 'actif') {
      challenges = buildChallengesForActiveSkill(
        skillItem,
        type,
        autoReply,
        shouldAddAttachment,
        typeForAttachment,
        learningContentConfig.locales,
        databaseBuilder,
      );
    }
    if (skillItem.status === 'archivé') {
      challenges = buildChallengesForArchivedSkill(
        skillItem,
        type,
        autoReply,
        shouldAddAttachment,
        typeForAttachment,
        learningContentConfig.locales,
        databaseBuilder,
      );
    }
    if (skillItem.status === 'périmé') {
      challenges = buildChallengesForObsoleteSkill(
        skillItem,
        type,
        autoReply,
        shouldAddAttachment,
        typeForAttachment,
        learningContentConfig.locales,
        databaseBuilder,
      );
    }
    challengeItems.push(...challenges);
    skillItem.challenges.push(...challenges);
  }
  await persistChallenges({ items: challengeItems, airtableClient, logger });
  const allAttachments = challengeItems.flatMap((challengeItem) => challengeItem.attachments);
  await persistAttachments({
    items: allAttachments,
    airtableClient,
    logger,
    databaseBuilder,
  });
}

export function buildChallenge({
  indexChallenge,
  skillItem,
  status,
  isProto,
  protoVersion,
  decliVersion,
  type = Challenge.TYPES.QCM,
  autoReply = false,
  shouldAddAttachment = false,
  typeForAttachment,
  databaseBuilder,
  locales,
}) {
  const partId = skillItem.id.split('skill')[1];
  const challengeId = `challenge${partId}Ch${indexChallenge}`;
  const attachments = [];
  if (shouldAddAttachment) {
    attachments.push(
      buildAttachment({
        challengeId,
        localizedChallengeId: challengeId,
        type: typeForAttachment,
        databaseBuilder,
        locale: locales[0],
      }),
    );
  }
  const challengeItem = {
    ...generateBaseChallengeData(status, autoReply),
    id: challengeId,
    status: status,
    skills: [skillItem.airtableId],
    skillId: skillItem.id,
    locales: [locales[0]],
    genealogy: isProto ? Challenge.GENEALOGIES.PROTOTYPE : Challenge.GENEALOGIES.DECLINAISON,
    version: protoVersion,
    alternativeVersion: decliVersion,
    type,
    autoReply,
  };
  databaseBuilder.factory.buildChallenge(challengeItem);
  addPrimaryLocalizedChallenge(challengeItem, databaseBuilder);
  if (status !== Challenge.STATUSES.PROPOSE && locales.length > 1) {
    const translatedLocales = [iterLocale.next().value, iterLocale.next().value];
    const statusForTranslation1 =
      status === Challenge.STATUSES.VALIDE ? LocalizedChallenge.STATUSES.PLAY : LocalizedChallenge.STATUSES.PAUSE;
    addTranslationFor(
      challengeItem,
      translatedLocales[0],
      statusForTranslation1,
      databaseBuilder,
      shouldAddAttachment,
      typeForAttachment,
      attachments,
    );
    if (translatedLocales[0] !== translatedLocales[1]) {
      addTranslationFor(
        challengeItem,
        translatedLocales[1],
        LocalizedChallenge.STATUSES.PAUSE,
        databaseBuilder,
        shouldAddAttachment,
        typeForAttachment,
        attachments,
      );
    }
  }
  challengeItem.attachments = attachments;
  return challengeItem;
}

export async function persistChallenges({ items, airtableClient, logger }) {
  const airtableItems = items.map(challengeDatasource.toAirTableObject);
  const records = await saveInAirtable({
    tableName: 'Epreuves',
    data: airtableItems,
    logger,
    airtableClient,
  });
  items.forEach((item) => {
    const airtableId = records.shift().id;
    item.airtableId = airtableId;
    item.attachments.forEach((att) => {
      att.challengeAirtableId = airtableId;
    });
  });
}

function buildChallengesForEnConstructionSkill(
  skillItem,
  type,
  autoReply,
  shouldAddAttachment,
  typeForAttachment,
  locales,
  databaseBuilder,
) {
  const challenges = [];
  challenges.push(
    buildChallenge({
      indexChallenge: 0,
      skillItem,
      status: Challenge.STATUSES.PROPOSE,
      isProto: true,
      protoVersion: skillItem.version,
      decliVersion: null,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 1,
      skillItem,
      status: Challenge.STATUSES.PROPOSE,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 1,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 2,
      skillItem,
      status: Challenge.STATUSES.PERIME,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 2,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  return challenges;
}

function buildChallengesForActiveSkill(
  skillItem,
  type,
  autoReply,
  shouldAddAttachment,
  typeForAttachment,
  locales,
  databaseBuilder,
) {
  const challenges = [];
  challenges.push(
    buildChallenge({
      indexChallenge: 0,
      skillItem,
      status: Challenge.STATUSES.VALIDE,
      isProto: true,
      protoVersion: skillItem.version,
      decliVersion: null,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 1,
      skillItem,
      status: Challenge.STATUSES.VALIDE,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 1,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 2,
      skillItem,
      status: Challenge.STATUSES.PERIME,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 2,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 3,
      skillItem,
      status: Challenge.STATUSES.ARCHIVE,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 3,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  return challenges;
}

function buildChallengesForArchivedSkill(
  skillItem,
  type,
  autoReply,
  shouldAddAttachment,
  typeForAttachment,
  locales,
  databaseBuilder,
) {
  const challenges = [];
  challenges.push(
    buildChallenge({
      indexChallenge: 0,
      skillItem,
      status: Challenge.STATUSES.ARCHIVE,
      isProto: true,
      protoVersion: skillItem.version,
      decliVersion: null,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 1,
      skillItem,
      status: Challenge.STATUSES.ARCHIVE,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 1,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 2,
      skillItem,
      status: Challenge.STATUSES.PERIME,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 2,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  return challenges;
}

function buildChallengesForObsoleteSkill(
  skillItem,
  type,
  autoReply,
  shouldAddAttachment,
  typeForAttachment,
  locales,
  databaseBuilder,
) {
  const challenges = [];
  challenges.push(
    buildChallenge({
      indexChallenge: 0,
      skillItem,
      status: Challenge.STATUSES.PERIME,
      isProto: true,
      protoVersion: skillItem.version,
      decliVersion: null,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  challenges.push(
    buildChallenge({
      indexChallenge: 1,
      skillItem,
      status: Challenge.STATUSES.PERIME,
      isProto: false,
      protoVersion: skillItem.version,
      decliVersion: 1,
      type,
      autoReply,
      shouldAddAttachment,
      typeForAttachment,
      databaseBuilder,
      locales,
    }),
  );
  return challenges;
}

function generateBaseChallengeData(status, autoReply) {
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
  let embedUrl, embedHeight, embedTitle;
  if (autoReply) {
    embedUrl = 'https://some-embed-url.com';
    embedTitle = 'some embed title';
    embedHeight = 400;
  }
  return {
    accessibility1: iterFor.accessibility1.next().value,
    accessibility2: iterFor.accessibility2.next().value,
    alpha: iterFor.alpha.next().value,
    author: ['DEV'],
    autoReply,
    contextualizedFields: [iterFor.contextualizedFields.next().value, iterFor.contextualizedFields.next().value],
    declinable: iterFor.declinable.next().value,
    delta: iterFor.delta.next().value,
    files: [],
    focusable: iterFor.focusable.next().value,
    format: iterFor.format.next().value,
    geography: 'AA',
    pedagogy: iterFor.pedagogy.next().value,
    responsive: iterFor.responsive.next().value,
    shuffled: iterFor.shuffled.next().value,
    spoil: iterFor.spoil.next().value,
    t1Status: iterFor.t1Status.next().value,
    t2Status: iterFor.t2Status.next().value,
    t3Status: iterFor.t3Status.next().value,
    timer: iterFor.timer.next().value,
    embedHeight,
    embedTitle,
    embedUrl,
    createdAt,
    updatedAt,
    validatedAt,
    archivedAt,
    madeObsoleteAt,
  };
}

function addPrimaryLocalizedChallenge(challengeData, databaseBuilder) {
  databaseBuilder.factory.buildLocalizedChallenge({
    ...generateBaseLocalizedChallengeData(),
    id: challengeData.id,
    challengeId: challengeData.id,
    locale: challengeData.locales[0],
    status: null,
    embedUrl: challengeData.embedUrl,
  });
  for (const translatableField of fields.filter((field) => field !== 'illustrationAlt')) {
    if (translatableField === 'embedTitle') {
      if (challengeData.embedTitle) {
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challengeData.id}.${translatableField}`,
          locale: challengeData.locales[0],
          value: `${challengeData.embedTitle}_${challengeData.locales[0]}`,
        });
      }
    } else {
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeData.id}.${translatableField}`,
        locale: challengeData.locales[0],
        value: `value ${challengeData.locales[0]} for ${translatableField}`,
      });
    }
  }
}

function addTranslationFor(
  challengeData,
  locale,
  status,
  databaseBuilder,
  shouldAddAttachment,
  typeForAttachment,
  attachments,
) {
  const localizedChallengeId = `${challengeData.id}-${locale}`;
  if (shouldAddAttachment) {
    attachments.push(
      buildAttachment({
        challengeId: challengeData.id,
        localizedChallengeId,
        type: typeForAttachment,
        databaseBuilder,
        locale,
      }),
    );
  }
  databaseBuilder.factory.buildLocalizedChallenge({
    ...generateBaseLocalizedChallengeData(),
    id: localizedChallengeId,
    challengeId: challengeData.id,
    locale: locale,
    status,
  });
  for (const translatableField of fields.filter((field) => field !== 'illustrationAlt')) {
    if (translatableField === 'embedTitle') {
      if (challengeData.embedTitle) {
        databaseBuilder.factory.buildTranslation({
          key: `challenge.${challengeData.id}.${translatableField}`,
          locale: locale,
          value: `${challengeData.embedTitle}_${locale}`,
        });
      }
    } else {
      databaseBuilder.factory.buildTranslation({
        key: `challenge.${challengeData.id}.${translatableField}`,
        locale: locale,
        value: `value ${locale} for ${translatableField}`,
      });
    }
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

export async function copyChallengesFromAirtable({ airtableClient, databaseBuilder, logger }) {
  const airtableChallenges = await airtableClient
    .table('Epreuves')
    .select({
      fields: [
        'id persistant',
        'Timer',
        "Type d'épreuve",
        'T1 - Espaces, casse & accents',
        'T2 - Ponctuation',
        "T3 - Distance d'édition",
        'Statut',
        'Acquix (id persistant)',
        'Embed height',
        'Format',
        'Réponse automatique',
        'Langues',
        'Focalisée',
        'Généalogie',
        'Type péda',
        'Auteur',
        'Déclinable',
        'Version prototype',
        'Version déclinaison',
        'Non voyant',
        'Daltonien',
        'Spoil',
        'Responsive',
        'Difficulté calculée',
        'Discrimination calculée',
        'updated_at',
        'created_at',
        'validated_at',
        'archived_at',
        'made_obsolete_at',
        'shuffled',
        'contextualizedFields',
      ],
    })
    .all();

  logger.info(`Copying ${airtableChallenges.length} challenges from airtable...`);

  airtableChallenges.forEach((record) => {
    databaseBuilder.factory.buildChallenge({
      id: record.get('id persistant'),
      type: record.get("Type d'épreuve"),
      t1Status: record.get('T1 - Espaces, casse & accents') === 'Activé',
      t2Status: record.get('T2 - Ponctuation') === 'Activé',
      t3Status: record.get("T3 - Distance d'édition") === 'Activé',
      status: record.get('Statut'),
      skillId: record.get('Acquix (id persistant)')?.[0],
      embedHeight: record.get('Embed height'),
      timer: record.get('Timer'),
      format: record.get('Format'),
      autoReply: record.get('Réponse automatique') ?? false,
      locales: convertLanguagesToLocales(record.get('Langues')),
      focusable: record.get('Focalisée') ?? false,
      genealogy: record.get('Généalogie'),
      pedagogy: record.get('Type péda'),
      author: record.get('Auteur'),
      declinable: record.get('Déclinable'),
      version: record.get('Version prototype'),
      alternativeVersion: record.get('Version déclinaison'),
      accessibility1: record.get('Non voyant'),
      accessibility2: record.get('Daltonien'),
      spoil: record.get('Spoil'),
      responsive: record.get('Responsive'),
      delta: record.get('Difficulté calculée'),
      alpha: record.get('Discrimination calculée'),
      updatedAt: record.get('updated_at'),
      validatedAt: record.get('validated_at'),
      archivedAt: record.get('archived_at'),
      madeObsoleteAt: record.get('made_obsolete_at'),
      createdAt: record.get('created_at'),
      shuffled: record.get('shuffled') ?? false,
      contextualizedFields: record.get('contextualizedFields'),
    });
  });
}

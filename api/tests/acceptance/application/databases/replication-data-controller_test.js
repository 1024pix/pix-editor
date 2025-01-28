import { beforeEach, describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { Attachment, Challenge, LocalizedChallenge, Mission } from '../../../../lib/domain/models/index.js';

const {
  buildFramework,
  buildArea,
  buildCompetence,
  buildTube,
  buildSkill,
  buildChallenge,
  buildTutorial,
  buildAttachment,
  buildThematic,
} = airtableBuilder.factory;

function omit(keys, obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => !keys.includes(k))
  );
}

async function mockCurrentContent() {
  const expectedCurrentContent = {};
  const expectedFramework = omit(['areaIds'], domainBuilder.buildFramework());
  expectedCurrentContent.frameworks = [expectedFramework];

  const area = domainBuilder.buildArea();
  const expectedArea = omit(['airtableId', 'competenceAirtableIds'], { name: area.name, ...area });
  expectedCurrentContent.areas = [expectedArea];

  const expectedCompetence = omit(['airtableId', 'thematicAirtableIds', 'tubeAirtableIds', 'areaAirtableId'], domainBuilder.buildCompetence({
    name_i18n: {
      fr: 'Français',
      en: 'English',
    },
    description_i18n: {
      fr: 'Description française',
      en: 'Description anglaise',
    }
  }));
  expectedCurrentContent.competences = [expectedCompetence];

  const expectedThematic = omit(['airtableId'], domainBuilder.buildThematic({
    name_i18n: {
      fr: 'Thématique en fr',
      en: 'Thematic in en',
    },
  }));
  expectedCurrentContent.thematics = [expectedThematic];

  const expectedTube = omit(['airtableId', 'index'], domainBuilder.buildTube());
  expectedCurrentContent.tubes = [expectedTube];

  expectedCurrentContent.skills = [{ ...domainBuilder.buildSkill({ id: 'recSkill1' }) }];

  const challenge = domainBuilder.buildChallenge({
    id: 'challenge-id',
    files: [
      { fileId: 'attid1', localizedChallengeId: 'challenge-id' },
      { fileId: 'attid2', localizedChallengeId: 'localized-challenge-id' },
    ],
    version:1,
    genealogy: Challenge.GENEALOGIES.PROTOTYPE,
    accessibility1: Challenge.ACCESSIBILITY1.OK,
    accessibility2: Challenge.ACCESSIBILITY2.OK,
  });
  const alternativeChallenge = domainBuilder.buildChallenge({
    id: 'challenge-id_alt',
    version: 1,
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
    accessibility2: Challenge.ACCESSIBILITY2.RAS,
    files: null,
  });
  const challengeNl = domainBuilder.buildChallenge({
    id: 'localized-challenge-id',
    locales: ['nl'],
    embedUrl: 'https://github.io/page/epreuve.html?lang=nl',
    translations: {
      nl: {
        instruction: 'Consigne en nl',
      },
    },
    files: [
      { fileId: 'attid1', localizedChallengeId: 'challenge-id' },
      { fileId: 'attid2', localizedChallengeId: 'localized-challenge-id' },
    ],
    accessibility1: challenge.accessibility1,
    accessibility2: challenge.accessibility2,
  });
  const expectedPrimaryProtoQualityAttributes = {
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
  };
  const expectedChallenge = {
    ...challenge,
    geography: 'Brésil',
    area: 'Brésil',
    urlsToConsult: [
      'https://example.com/',
      'https://pix.org/nl-be',
    ],
    ...expectedPrimaryProtoQualityAttributes,
  };
  delete expectedChallenge.localizedChallenges;
  const expectedAlternativeChallenge = {
    ...alternativeChallenge,
    area: 'Neutre',
    files: [],
    accessibility1: challenge.accessibility1,
    accessibility2: challenge.accessibility2,
    ...expectedPrimaryProtoQualityAttributes,
  };
  delete expectedAlternativeChallenge.localizedChallenges;
  const expectedChallengeNl = { ...challengeNl, ...expectedPrimaryProtoQualityAttributes, illustrationAlt: 'alt_nl', geography: 'Neutre', area: 'Neutre' };
  delete expectedChallengeNl.localizedChallenges;
  expectedCurrentContent.challenges = [expectedChallenge, expectedChallengeNl, expectedAlternativeChallenge];

  const expectedAttachment = {
    id: 'attid1',
    challengeId: challenge.id,
    url: 'http://example.fr',
    mimeType: 'mimeType1',
    filename: 'nom_fichier_1',
    type: Attachment.TYPES.ILLUSTRATION,
    alt: null,
    localizedChallenge: challenge.id,
  };
  const expectedAttachmentNl = {
    id: 'attid2',
    challengeId: challenge.id,
    url: 'http://example.nl',
    mimeType: 'mimeType2',
    filename: 'nom_fichier_2',
    type: Attachment.TYPES.ILLUSTRATION,
    alt: 'alt_nl',
    localizedChallengeId: 'localized-challenge-id',
  };
  expectedCurrentContent.attachments = [
    { ...domainBuilder.buildAttachment(expectedAttachment),  alt: null, },
    {
      ...domainBuilder.buildAttachment({ ...expectedAttachmentNl, challengeId: challengeNl.id }),
      alt: 'alt_nl'
    },
  ];

  expectedCurrentContent.tutorials = [domainBuilder.buildTutorialDatasourceObject()];

  expectedCurrentContent.courses = [
    {
      id: 'recCourse1',
      name: 'nameCourse1',
    },
    {
      id: 'recCourse2',
      name: 'nameCourse2',
    },
  ];

  expectedCurrentContent.missions = [
    {
      id: 123456789,
      name_i18n: { fr: 'validated mission PG name' },
      competenceId: 'competenceId',
      thematicIds: 'thematicIds',
      learningObjectives_i18n: { fr: 'Que tu sois le meilleur' },
      validatedObjectives_i18n: { fr: 'Rien' },
      status: Mission.status.VALIDATED,
      createdAt: new Date('2010-01-04').toISOString(),
      introductionMediaUrl: null,
      introductionMediaType: null,
      introductionMediaAlt_i18n: { fr: 'Message alternatif' },
      documentationUrl: 'http://url-example.net',
      cardImageUrl: null,
      content: {
        dareChallenges: [],
        steps: [],
      },
    },
  ];

  const airtableSkill = buildSkill(expectedCurrentContent.skills[0]);
  airtableBuilder.mockLists({
    frameworks: [buildFramework(expectedCurrentContent.frameworks[0])],
    areas: [buildArea(expectedCurrentContent.areas[0])],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    thematics: [buildThematic(expectedCurrentContent.thematics[0])],
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    skills: [{
      ...airtableSkill,
    }],
    challenges: [buildChallenge({
      ...expectedChallenge,
      files: [
        {
          fileId: expectedAttachment.id,
          localizedChallengeId: expectedChallenge.id
        },
        {
          fileId: expectedAttachmentNl.id,
          localizedChallengeId: expectedChallengeNl.id
        },
      ]
    }),
    buildChallenge({
      ...alternativeChallenge
    })
    ],
    attachments: [
      buildAttachment(expectedAttachment),
      buildAttachment(expectedAttachmentNl)
    ],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
  });
  databaseBuilder.factory.buildStaticCourse({
    id: 'recCourse2',
    name: 'nameCourse2',
    description: 'Description du Course',
    challengeIds: 'recChallenge0',
  });
  databaseBuilder.factory.buildStaticCourse({
    id: 'recCourse1',
    name: 'nameCourse1',
    description: 'Description du Course',
    challengeIds: 'recChallenge0',
  });

  databaseBuilder.factory.buildMission({
    id: 123456789,
    name: 'validated mission PG name',
    competenceId: 'competenceId',
    learningObjectives: 'Que tu sois le meilleur',
    thematicIds: 'thematicIds',
    validatedObjectives: 'Rien',
    status: Mission.status.VALIDATED,
    documentationUrl: 'http://url-example.net'
  });

  databaseBuilder.factory.buildLocalizedChallenge({
    id: challenge.id,
    challengeId: challenge.id,
    locale: 'fr',
    embedUrl: challenge.embedUrl,
    status: LocalizedChallenge.STATUSES.PLAY,
    geography: 'BR',
    urlsToConsult: [
      'https://example.com/',
      'https://pix.org/nl-be',
    ],
    ...expectedPrimaryProtoQualityAttributes,
  });
  databaseBuilder.factory.buildLocalizedChallenge({
    id: alternativeChallenge.id,
    challengeId: alternativeChallenge.id,
    locale: 'fr',
    embedUrl: alternativeChallenge.embedUrl,
    status: LocalizedChallenge.STATUSES.PLAY,
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
    isAwarenessChallenge: true,
    toRephrase: false,
  });
  databaseBuilder.factory.buildLocalizedChallenge({
    id: 'localized-challenge-id',
    challengeId: challenge.id,
    locale: 'nl',
    status: LocalizedChallenge.STATUSES.PLAY,
    geography: null,
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
    isAwarenessChallenge: false,
    toRephrase: false,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${challenge.id}.instruction`,
    locale: 'nl',
    value: 'Consigne en nl',
  });

  databaseBuilder.factory.buildTranslation({
    key: `area.${expectedCurrentContent.areas[0].id}.title`,
    locale: 'fr',
    value: expectedCurrentContent.areas[0].title_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `area.${expectedCurrentContent.areas[0].id}.title`,
    locale: 'en',
    value: expectedCurrentContent.areas[0].title_i18n.en,
  });

  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.name`,
    locale: 'fr',
    value: expectedCurrentContent.competences[0].name_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.name`,
    locale: 'en',
    value: expectedCurrentContent.competences[0].name_i18n.en,
  });
  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.description`,
    locale: 'fr',
    value: expectedCurrentContent.competences[0].description_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.description`,
    locale: 'en',
    value: expectedCurrentContent.competences[0].description_i18n.en,
  });

  databaseBuilder.factory.buildTranslation({
    key: `thematic.${expectedCurrentContent.thematics[0].id}.name`,
    locale: 'fr',
    value: expectedCurrentContent.thematics[0].name_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `thematic.${expectedCurrentContent.thematics[0].id}.name`,
    locale: 'en',
    value: expectedCurrentContent.thematics[0].name_i18n.en,
  });

  databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalTitle`,
    locale: 'fr',
    value: expectedCurrentContent.tubes[0].practicalTitle_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalTitle`,
    locale: 'en',
    value: expectedCurrentContent.tubes[0].practicalTitle_i18n.en,
  });
  databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalDescription`,
    locale: 'fr',
    value: expectedCurrentContent.tubes[0].practicalDescription_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalDescription`,
    locale: 'en',
    value: expectedCurrentContent.tubes[0].practicalDescription_i18n.en,
  });

  databaseBuilder.factory.buildTranslation({
    key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
    locale: 'fr',
    value: expectedCurrentContent.skills[0].hint_i18n.fr,
  });
  databaseBuilder.factory.buildTranslation({
    key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
    locale: 'en',
    value: expectedCurrentContent.skills[0].hint_i18n.en,
  });

  for (const challengeForTranslation of [expectedChallenge, expectedAlternativeChallenge]) {
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.instruction`,
      locale: 'fr',
      value: challengeForTranslation.instruction,
    });
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.alternativeInstruction`,
      locale: 'fr',
      value: challengeForTranslation.alternativeInstruction,
    });
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.proposals`,
      locale: 'fr',
      value: challengeForTranslation.proposals,
    });
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.solution`,
      locale: 'fr',
      value: challengeForTranslation.solution,
    });
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.solutionToDisplay`,
      locale: 'fr',
      value: challengeForTranslation.solutionToDisplay,
    });
    databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.embedTitle`,
      locale: 'fr',
      value: challengeForTranslation.embedTitle,
    });
  }

  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedChallenge.id}.illustrationAlt`,
    locale: 'nl',
    value: expectedAttachmentNl.alt,
  });

  await databaseBuilder.commit();

  return expectedCurrentContent;
}

describe('Acceptance | Controller | replication-data-controller', () => {

  let user;

  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/replication-data', function() {
    it.fails('should return data for replication', async function() {
      const expectedCurrentContent = await mockCurrentContent();

      const server = await createServer();
      const currentContentOptions = {
        method: 'GET',
        url: '/api/replication-data',
        headers: generateAuthorizationHeader(user),
      };

      // when
      const response = await server.inject(currentContentOptions);

      // then
      expect(JSON.parse(response.result)).toStrictEqual(expectedCurrentContent);
    });
  });
});

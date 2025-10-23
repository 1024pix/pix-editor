import { beforeEach, describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader, } from '../../test-helper.js';
import { createServer } from '../../../server.js';
import { Attachment, Challenge, LocalizedChallenge, Mission } from '../../../lib/domain/models/index.js';
import _ from 'lodash';
import {
  AreaForReplication,
  FrameworkForReplication,
  SkillForReplication
} from '../../../lib/domain/models/replication/index.js';

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

describe('Acceptance | Controller | replication-data-controller', () => {

  let user;

  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/replication-data', function() {
    it('should return data for replication', async function() {
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
      const result = JSON.parse(response.result);
      const resultWithoutTranslations = _.omit(result, 'translations');
      const expectedCurrentContentWithoutTranslations = _.omit(expectedCurrentContent, 'translations');
      expect(resultWithoutTranslations).toStrictEqual(expectedCurrentContentWithoutTranslations);
      expect(result.translations).toMatchObject(expectedCurrentContent.translations.map((translation) => ({
        ...translation,
        id: expect.any(Number)
      })));
    });
  });
});

function omit(keys, obj) {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([k]) => !keys.includes(k))
  );
}

async function mockCurrentContent() {
  const expectedCurrentContent = {
    translations: [],
  };
  const expectedFramework = new FrameworkForReplication(domainBuilder.buildFramework());
  expectedCurrentContent.frameworks = [{ ...expectedFramework }];

  const area = domainBuilder.buildArea({ frameworkId: expectedFramework.id, competenceIds: ['recCompetence1'] });
  const expectedArea = new AreaForReplication({ name: area.name, ...area });
  expectedCurrentContent.areas = [{ ...expectedArea }];

  const expectedCompetence = omit(['airtableId', 'thematicAirtableIds', 'tubeAirtableIds', 'tubeIds', 'areaAirtableId'], domainBuilder.buildCompetence({
    name_i18n: {
      fr: 'Français',
      en: 'English',
    },
    description_i18n: {
      fr: 'Description française',
      en: 'Description anglaise',
    },
    skillIds: ['recSkill1'],
    origin: 'Nom du referentiel',
  }));
  expectedCurrentContent.competences = [expectedCompetence];

  const expectedThematic = omit(['airtableId', 'competenceAirtableId', 'tubeAirtableIds'], domainBuilder.buildThematic({
    id: 'recThematic1',
    name_i18n: {
      fr: 'Thématique en fr',
      en: 'Thematic in en',
    },
    competenceId: expectedCompetence.id,
    tubeIds: ['recTube1'],
  }));
  expectedCurrentContent.thematics = [expectedThematic];

  const expectedTube = omit(['airtableId', 'index', 'competenceAirtableId', 'skillAirtableIds', 'thematicAirtableId'], domainBuilder.buildTube({
    id: 'recTube1',
    thematicId: expectedThematic.id,
    competenceId: expectedCompetence.id,
    skillIds: ['recSkill1'],
  }));
  expectedCurrentContent.tubes = [{
    ...expectedTube,
    isMobileCompliant: false,
    isTabletCompliant: false,
  }];

  const baseSkill = domainBuilder.buildSkill({
    id: 'recSkill1',
    airtableId: 'recSkill1',
    tubeId: expectedTube.id,
    tutorialIds: ['recTuto1'],
    learningMoreTutorialIds: ['recTuto2'],
    createdAt: '2023-10-05T18:08:00Z',
    activatedAt: '2023-11-06T18:08:00.000Z',
    archivedAt: '2023-12-07T18:08:00.000Z',
    obsoletedAt: '2024-01-08T18:08:00.000Z',
  });
  expectedCurrentContent.skills = [{ ...new SkillForReplication(baseSkill) }];

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
    skillId: 'recSkill1',
  });
  const alternativeChallenge = domainBuilder.buildChallenge({
    id: 'challenge-id-alt',
    version: 1,
    genealogy: Challenge.GENEALOGIES.DECLINAISON,
    accessibility1: Challenge.ACCESSIBILITY1.A_TESTER,
    accessibility2: Challenge.ACCESSIBILITY2.RAS,
    files: null,
    skillId: 'recSkill1',
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
    validatedAt: '2023-01-02T18:08:08.000Z',
    skillId: 'recSkill1',
  });
  const expectedPrimaryProtoQualityAttributes = {
    requireGafamWebsiteAccess: true,
    isIncompatibleIpadCertif: true,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.OK,
    isAwarenessChallenge: true,
    toRephrase: true,
    hasEmbedInternalValidation: true,
    noValidationNeeded: true,
  };
  const expectedChallenge = {
    ...challenge,
    geography: 'BR',
    area: 'BR',
    urlsToConsult: [
      'https://example.com/',
      'https://pix.org/nl-be',
    ],
    ...expectedPrimaryProtoQualityAttributes,
  };
  delete expectedChallenge.localizedChallenges;
  const expectedAlternativeChallenge = {
    ...alternativeChallenge,
    geography: null,
    area: null,
    files: [],
    accessibility1: challenge.accessibility1,
    accessibility2: challenge.accessibility2,
    ...expectedPrimaryProtoQualityAttributes,
  };
  delete expectedAlternativeChallenge.localizedChallenges;
  const expectedChallengeNl = { ...challengeNl, ...expectedPrimaryProtoQualityAttributes, illustrationAlt: 'alt_nl', geography: 'RO', area: 'RO' };
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
    omit(['airtableChallengeId', 'mimeType', 'localizedChallengeId'], { ...domainBuilder.buildAttachment(expectedAttachment),  alt: null, }),
    omit(['airtableChallengeId', 'mimeType', 'localizedChallengeId'], {
      ...domainBuilder.buildAttachment({ ...expectedAttachmentNl, challengeId: challengeNl.id }),
      alt: 'alt_nl'
    }),
  ];

  expectedCurrentContent.tutorials = [
    domainBuilder.buildTutorialDatasourceObject({ id: 'recTuto1', tagIds: [] }),
    domainBuilder.buildTutorialDatasourceObject({ id: 'recTuto2', tagIds: [] }),
  ];

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

  expectedCurrentContent.frameworks.forEach(databaseBuilder.factory.buildFramework);
  expectedCurrentContent.areas.forEach(databaseBuilder.factory.buildArea);
  expectedCurrentContent.competences.forEach(databaseBuilder.factory.buildCompetence);
  expectedCurrentContent.thematics.forEach(databaseBuilder.factory.buildThematic);
  expectedCurrentContent.tubes.forEach(databaseBuilder.factory.buildTube);
  expectedCurrentContent.tutorials.forEach(databaseBuilder.factory.buildTutorial);
  expectedCurrentContent.skills.forEach(databaseBuilder.factory.buildSkill);
  databaseBuilder.factory.buildChallenge(challenge);
  databaseBuilder.factory.buildChallenge(alternativeChallenge);

  airtableBuilder.mockLists({
    frameworks: [buildFramework({ ...expectedFramework, areaIds: [expectedArea.id] })],
    areas: [buildArea(expectedArea)],
    competences: [buildCompetence({ ...expectedCompetence, tubeIds: [expectedTube.id] })],
    thematics: [buildThematic(expectedThematic)],
    tubes: [buildTube({ ...expectedTube, competenceId: expectedCompetence.id, skillIds: [baseSkill.id] })],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
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
    tutorials: expectedCurrentContent.tutorials.map(buildTutorial),
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

  const mission = databaseBuilder.factory.buildMission({
    id: 123456789,
    name: 'validated mission PG name',
    competenceId: 'competenceId',
    learningObjectives: 'Que tu sois le meilleur',
    thematicIds: 'thematicIds',
    validatedObjectives: 'Rien',
    status: Mission.status.VALIDATED,
    documentationUrl: 'http://url-example.net',
  }, false);

  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `mission.${mission.id}.name`,
    locale: 'fr',
    value: 'validated mission PG name',
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `mission.${mission.id}.learningObjectives`,
    locale: 'fr',
    value: 'Que tu sois le meilleur',
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `mission.${mission.id}.validatedObjectives`,
    locale: 'fr',
    value: 'Rien',
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `mission.${mission.id}.introductionMediaAlt`,
    locale: 'fr',
    value: 'Message alternatif',
  }));

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
    geography: null,
  });
  databaseBuilder.factory.buildLocalizedChallenge({
    id: 'localized-challenge-id',
    challengeId: challenge.id,
    locale: 'nl',
    status: LocalizedChallenge.STATUSES.PLAY,
    geography: 'RO',
    requireGafamWebsiteAccess: false,
    isIncompatibleIpadCertif: false,
    deafAndHardOfHearing: LocalizedChallenge.DEAF_AND_HARD_OF_HEARING_VALUES.KO,
    isAwarenessChallenge: false,
    toRephrase: false,
    validatedAt: new Date('2023-01-02T18:08:08Z'),
  });

  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `area.${expectedCurrentContent.areas[0].id}.title`,
    locale: 'fr',
    value: expectedCurrentContent.areas[0].title_i18n.fr,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `area.${expectedCurrentContent.areas[0].id}.title`,
    locale: 'en',
    value: expectedCurrentContent.areas[0].title_i18n.en,
  }));

  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.name`,
    locale: 'fr',
    value: expectedCurrentContent.competences[0].name_i18n.fr,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.name`,
    locale: 'en',
    value: expectedCurrentContent.competences[0].name_i18n.en,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.description`,
    locale: 'fr',
    value: expectedCurrentContent.competences[0].description_i18n.fr,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `competence.${expectedCurrentContent.competences[0].id}.description`,
    locale: 'en',
    value: expectedCurrentContent.competences[0].description_i18n.en,
  }));

  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `thematic.${expectedCurrentContent.thematics[0].id}.name`,
    locale: 'fr',
    value: expectedCurrentContent.thematics[0].name_i18n.fr,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `thematic.${expectedCurrentContent.thematics[0].id}.name`,
    locale: 'en',
    value: expectedCurrentContent.thematics[0].name_i18n.en,
  }));

  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalTitle`,
    locale: 'fr',
    value: expectedCurrentContent.tubes[0].practicalTitle_i18n.fr,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalTitle`,
    locale: 'en',
    value: expectedCurrentContent.tubes[0].practicalTitle_i18n.en,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalDescription`,
    locale: 'fr',
    value: expectedCurrentContent.tubes[0].practicalDescription_i18n.fr,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `tube.${expectedCurrentContent.tubes[0].id}.practicalDescription`,
    locale: 'en',
    value: expectedCurrentContent.tubes[0].practicalDescription_i18n.en,
  }));

  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
    locale: 'fr',
    value: expectedCurrentContent.skills[0].hint_i18n.fr,
  }));
  expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
    key: `skill.${expectedCurrentContent.skills[0].id}.hint`,
    locale: 'en',
    value: expectedCurrentContent.skills[0].hint_i18n.en,
  }));

  for (const challengeForTranslation of [expectedChallenge, expectedAlternativeChallenge]) {
    expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.instruction`,
      locale: 'fr',
      value: challengeForTranslation.instruction,
    }));
    expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.alternativeInstruction`,
      locale: 'fr',
      value: challengeForTranslation.alternativeInstruction,
    }));
    expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.proposals`,
      locale: 'fr',
      value: challengeForTranslation.proposals,
    }));
    expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.solution`,
      locale: 'fr',
      value: challengeForTranslation.solution,
    }));
    expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.solutionToDisplay`,
      locale: 'fr',
      value: challengeForTranslation.solutionToDisplay,
    }));
    expectedCurrentContent.translations.push(databaseBuilder.factory.buildTranslation({
      key: `challenge.${challengeForTranslation.id}.embedTitle`,
      locale: 'fr',
      value: challengeForTranslation.embedTitle,
    }));
  }

  expectedCurrentContent.translations.forEach((translation) => {
    translation.sourceEntityId = null;
  });

  expectedCurrentContent.translations.push({
    ...databaseBuilder.factory.buildTranslation({
      key: `challenge.${challenge.id}.instruction`,
      locale: 'nl',
      value: 'Consigne en nl',
    }),
    key: 'challenge.localized-challenge-id.instruction',
    entityId: 'localized-challenge-id',
    sourceEntityId: challenge.id,
  });

  expectedCurrentContent.translations.push({
    ...databaseBuilder.factory.buildTranslation({
      key: `challenge.${expectedChallenge.id}.illustrationAlt`,
      locale: 'nl',
      value: expectedAttachmentNl.alt,
    }),
    key: 'challenge.localized-challenge-id.illustrationAlt',
    entityId: 'localized-challenge-id',
    sourceEntityId: expectedChallenge.id,
  });

  expectedCurrentContent.translations = expectedCurrentContent.translations.sort((trA, trB) => {
    const compareKey = trA.key.localeCompare(trB.key);
    if (compareKey === 0) {
      return trA.locale.localeCompare(trB.locale);
    }
    return compareKey;
  });

  await databaseBuilder.commit();

  return expectedCurrentContent;
}

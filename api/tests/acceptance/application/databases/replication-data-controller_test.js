import { beforeEach, describe, expect, it } from 'vitest';
import { airtableBuilder, databaseBuilder, domainBuilder, generateAuthorizationHeader } from '../../../test-helper.js';
import { createServer } from '../../../../server.js';
import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

const {
  buildArea,
  buildCompetence,
  buildTube,
  buildSkill,
  buildChallenge,
  buildTutorial,
  buildAttachment,
  buildThematic,
} = airtableBuilder.factory;

async function mockCurrentContent() {
  const challenge = domainBuilder.buildChallenge({
    id: 'challenge-id',
    files: [
      { fileId: 'attid1', localizedChallengeId: 'challenge-id' },
      { fileId: 'attid2', localizedChallengeId: 'localized-challenge-id' },
    ],
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
  });

  const expectedAttachment = {
    id: 'attid1',
    challengeId: challenge.id,
    url: 'http://example.fr',
    mimeType: 'mimeType1',
    filename: 'nom_fichier_1',
    type: 'lol',
    alt: null,
    localizedChallenge: challenge.id,
  };
  const expectedAttachmentNl = {
    id: 'attid2',
    challengeId: challenge.id,
    url: 'http://example.nl',
    mimeType: 'mimeType2',
    filename: 'nom_fichier_2',
    type: 'illustration',
    alt: 'alt_nl',
    localizedChallengeId: 'localized-challenge-id',
  };

  const expectedChallenge = {
    ...challenge,
    geography: 'Brésil',
    area: 'Brésil',
    urlsToConsult: [
      'https://example.com/',
      'https://pix.org/nl-be',
    ],
  };
  delete expectedChallenge.localizedChallenges;

  const expectedChallengeNl = { ...challengeNl, illustrationAlt: 'alt_nl', geography: 'Neutre', area: 'Neutre' };
  delete expectedChallengeNl.localizedChallenges;
  const expectedCurrentContent = {
    attachments: [
      { ...domainBuilder.buildAttachment(expectedAttachment),  alt: null, },
      {
        ...domainBuilder.buildAttachment({ ...expectedAttachmentNl, challengeId: challengeNl.id }),
        alt: 'alt_nl'
      },
    ],
    areas: [domainBuilder.buildArea()],
    competences: [domainBuilder.buildCompetence({
      name_i18n: {
        fr: 'Français',
        en: 'English',
      },
      description_i18n: {
        fr: 'Description française',
        en: 'Description anglaise',
      }
    })],
    tubes: [domainBuilder.buildTube()],
    skills: [{
      ...domainBuilder.buildSkill({ id: 'recSkill1' }),
      spoil_focus: 'en_devenir',
      spoil_variabilisation: [],
      spoil_mauvaisereponse: ['courgette', '67'],
      spoil_nouvelacquis: null,
    }],
    challenges: [expectedChallenge, expectedChallengeNl],
    tutorials: [domainBuilder.buildTutorialDatasourceObject()],
    thematics: [domainBuilder.buildThematic({
      name_i18n: {
        fr: 'Thématique en fr',
        en: 'Thematic in en',
      },
    })],
    courses: [{
      id: 'recCourse1',
      name: 'nameCourse1',
    },
    {
      id: 'recCourse2',
      name: 'nameCourse2',
    }],
  };
  const airtableSkill = buildSkill(expectedCurrentContent.skills[0]);
  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    skills: [{
      ...airtableSkill,
      fields: {
        ...airtableSkill.fields,
        Spoil_focus: 'en_devenir',
        Spoil_variabilisation: [''],
        Spoil_mauvaisereponse: ['courgette', '67'],
        Spoil_nouvelacquis: null,
      },
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
    })],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
    thematics: [buildThematic(expectedCurrentContent.thematics[0])],
    attachments: [
      buildAttachment(expectedAttachment),
      buildAttachment(expectedAttachmentNl)
    ],
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
  });
  databaseBuilder.factory.buildLocalizedChallenge({
    id: 'localized-challenge-id',
    challengeId: challenge.id,
    locale: 'nl',
    status: LocalizedChallenge.STATUSES.PLAY,
    geography: null,
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

  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedChallenge.id}.instruction`,
    locale: 'fr',
    value: expectedChallenge.instruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedChallenge.id}.alternativeInstruction`,
    locale: 'fr',
    value: expectedChallenge.alternativeInstruction,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedChallenge.id}.proposals`,
    locale: 'fr',
    value: expectedChallenge.proposals,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedChallenge.id}.solution`,
    locale: 'fr',
    value: expectedChallenge.solution,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedChallenge.id}.solutionToDisplay`,
    locale: 'fr',
    value: expectedChallenge.solutionToDisplay,
  });
  databaseBuilder.factory.buildTranslation({
    key: `challenge.${expectedChallenge.id}.embedTitle`,
    locale: 'fr',
    value: expectedChallenge.embedTitle,
  });

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
      expect(JSON.parse(response.result)).to.deep.equal(expectedCurrentContent);
    });
  });
});

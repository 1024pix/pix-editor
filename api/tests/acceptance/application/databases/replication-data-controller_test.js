import { beforeEach, describe, expect, it } from 'vitest';
import {
  generateAuthorizationHeader,
  databaseBuilder,
  airtableBuilder,
  domainBuilder
} from '../../../test-helper.js';
import { createServer } from '../../../../server.js';

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
  const expectedChallenge = { ...challenge };
  delete expectedChallenge.localizedChallenges;

  const expectedChallengeNl = { ...challengeNl };
  delete expectedChallengeNl.localizedChallenges;

  const expectedAttachment = { id: 'attid1', challengeId: challenge.id, url: 'http://example.fr', type: 'lol', alt: 'stop' };
  const expectedAttachmentNl = { id: 'attid2', challengeId: challengeNl.id, url: 'http://example.nl', type: 'haha', alt: 'arrête' };

  const expectedCurrentContent = {
    attachments: [
      domainBuilder.buildAttachment(expectedAttachment),
      domainBuilder.buildAttachment({ ...expectedAttachmentNl, challengeId: challengeNl.id }),
    ],
    areas: [domainBuilder.buildAreaDatasourceObject()],
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
    tubes: [domainBuilder.buildTubeDatasourceObject()],
    skills: [domainBuilder.buildSkill()],
    challenges: [expectedChallenge, expectedChallengeNl],
    tutorials: [domainBuilder.buildTutorialDatasourceObject()],
    thematics: [domainBuilder.buildThematicDatasourceObject()],
    courses: [{
      id: 'recCourse1',
      name: 'nameCourse1',
    },
    {
      id: 'recCourse2',
      name: 'nameCourse2',
    }],
  };

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
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
    status: 'validé',
  });
  databaseBuilder.factory.buildLocalizedChallenge({
    id: 'localized-challenge-id',
    challengeId: challenge.id,
    locale: 'nl',
    status: 'validé',
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

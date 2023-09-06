const {
  expect,
  generateAuthorizationHeader,
  databaseBuilder,
  airtableBuilder,
  domainBuilder
} = require('../../../test-helper');
const createServer = require('../../../../server');

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
  const expectedCurrentContent = {
    attachments: [domainBuilder.buildAttachment()],
    areas: [domainBuilder.buildAreaAirtableDataObject()],
    competences: [domainBuilder.buildCompetenceForRelease({
      name_i18n: {
        fr: 'Français',
        en: 'English',
      },
      description_i18n: {
        fr: 'Description française',
        en: 'Description anglaise',
      }
    })],
    tubes: [domainBuilder.buildTubeAirtableDataObject()],
    skills: [domainBuilder.buildSkillAirtableDataObject()],
    challenges: [domainBuilder.buildChallengeAirtableDataObject()],
    tutorials: [domainBuilder.buildTutorialAirtableDataObject()],
    thematics: [domainBuilder.buildThematicAirtableDataObject()],
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
    challenges: [buildChallenge(expectedCurrentContent.challenges[0])],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
    thematics: [buildThematic(expectedCurrentContent.thematics[0])],
    attachments: [buildAttachment(expectedCurrentContent.attachments[0])],
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

      await databaseBuilder.commit();
      const server = await createServer();
      const currentContentOptions = {
        method: 'GET',
        url: '/api/replication-data',
        headers: generateAuthorizationHeader(user),
      };

      // when
      const response = await server.inject(currentContentOptions);

      // then
      expect(JSON.parse(response.result)).to.deep.equal(JSON.parse(JSON.stringify(expectedCurrentContent)));
    });
  });
});

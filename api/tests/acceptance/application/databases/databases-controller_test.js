const { expect, generateAuthorizationHeader, databaseBuilder, airtableBuilder, domainBuilder } = require('../../../test-helper');
const createServer = require('../../../../server');

const {
  buildArea,
  buildCompetence,
  buildTube,
  buildSkill,
  buildChallenge,
  buildTutorial,
  buildCourse,
  buildAttachment,
} = airtableBuilder.factory;

function mockCurrentContent() {
  const expectedCurrentContent = {
    attachments: [domainBuilder.buildAttachment()],
    areas: [domainBuilder.buildAreaAirtableDataObject()],
    competences: [domainBuilder.buildCompetenceAirtableDataObject()],
    tubes: [domainBuilder.buildTubeAirtableDataObject()],
    skills: [domainBuilder.buildSkillAirtableDataObject()],
    challenges: [domainBuilder.buildChallenge()],
    tutorials: [domainBuilder.buildTutorial()],
    courses: [domainBuilder.buildCourse({ challenges: ['recChallenge0'] })],
  };

  airtableBuilder.mockLists({
    areas: [buildArea(expectedCurrentContent.areas[0])],
    competences: [buildCompetence(expectedCurrentContent.competences[0])],
    tubes: [buildTube(expectedCurrentContent.tubes[0])],
    skills: [buildSkill(expectedCurrentContent.skills[0])],
    challenges: [buildChallenge(domainBuilder.buildChallenge(expectedCurrentContent.challenges[0]))],
    tutorials: [buildTutorial(expectedCurrentContent.tutorials[0])],
    courses: [buildCourse(expectedCurrentContent.courses[0])],
    attachments: [buildAttachment(expectedCurrentContent.attachments[0])],
  });

  return expectedCurrentContent;
}

describe('Acceptance | Controller | databases-controller', () => {

  let user;

  beforeEach(async function() {
    user = databaseBuilder.factory.buildAdminUser();
    await databaseBuilder.commit();
  });

  describe('GET /api/databases/airtable', function() {
    it('should return data from Airtable', async function() {
      const expectedCurrentContent = mockCurrentContent();
      const server = await createServer();
      const currentContentOptions = {
        method: 'GET',
        url: '/api/databases/airtable',
        headers: generateAuthorizationHeader(user),
      };

      // when
      const response = await server.inject(currentContentOptions);

      // then
      expect(JSON.parse(response.result)).to.deep.equal(expectedCurrentContent);
      expect(JSON.parse(response.result).courses[0].challenges).to.deep.equal(expectedCurrentContent.courses[0].challenges);
    });
  });

});

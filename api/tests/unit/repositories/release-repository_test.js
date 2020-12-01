const { PassThrough } = require('stream');
const { expect, streamToPromise, sinon } = require('../../test-helper');
const areaDatasource = require('../../../lib/infrastructure/datasources/airtable/area-datasource');
const competenceDatasource = require('../../../lib/infrastructure/datasources/airtable/competence-datasource');
const tubeDatasource = require('../../../lib/infrastructure/datasources/airtable/tube-datasource');
const skillDatasource = require('../../../lib/infrastructure/datasources/airtable/skill-datasource');
const challengeDatasource = require('../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const courseDatasource = require('../../../lib/infrastructure/datasources/airtable/course-datasource');
const releaseRepository = require('../../../lib/infrastructure/repositories/release-repository');

describe('Unit | Controller | release-repository', () => {

  describe('#getCurrentContentAsStream', () => {
    let writableStream;
    let releasePromise;
  
    beforeEach(() => {
      writableStream = new PassThrough();
      releasePromise = streamToPromise(writableStream);
    });
    it('should return current content as a stream', async () => {
      //Given
      sinon.stub(areaDatasource, 'list').resolves([]);
      sinon.stub(competenceDatasource, 'list').resolves([]);
      sinon.stub(tubeDatasource, 'list').resolves([]);
      sinon.stub(skillDatasource, 'list').resolves([]);
      sinon.stub(challengeDatasource, 'list').resolves([]);
      sinon.stub(tutorialDatasource, 'list').resolves([]);
      sinon.stub(courseDatasource, 'list').resolves([]);
      
      const expectedCurrentContent = {
        areas: [],
        competences: [],
        tubes: [],
        skills: [],
        challenges: [],
        tutorials: [],
        courses: [],
      };
      
      //When
      releaseRepository.getCurrentContentAsStream(writableStream);
      const currentContent = await releasePromise;
      
      //Then
      expect(JSON.parse(currentContent)).to.deep.equal(expectedCurrentContent);
    });
    it('should end the stream with an error when an error occured', async () => {
      //Given
      sinon.stub(areaDatasource, 'list').resolves([]);
      sinon.stub(competenceDatasource, 'list').resolves([]);
      sinon.stub(tubeDatasource, 'list').resolves([]);
      sinon.stub(skillDatasource, 'list').resolves([]);
      sinon.stub(challengeDatasource, 'list').resolves([]);
      sinon.stub(tutorialDatasource, 'list').resolves([]);
      courseDatasource.list = async() => { throw new Error(); };
      
      //When
      releaseRepository.getCurrentContentAsStream(writableStream);
      
      //Then
      expect(await releasePromise).to.match(/error$/);
    });
  });
});

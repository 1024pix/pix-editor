const { PassThrough } = require('stream');
const { expect, streamToPromise, sinon } = require('../../test-helper');
const areaDatasource = require('../../../lib/infrastructure/datasources/airtable/area-datasource');
const competenceDatasource = require('../../../lib/infrastructure/datasources/airtable/competence-datasource');
const tubeDatasource = require('../../../lib/infrastructure/datasources/airtable/tube-datasource');
const skillDatasource = require('../../../lib/infrastructure/datasources/airtable/skill-datasource');
const challengeDatasource = require('../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const courseDatasource = require('../../../lib/infrastructure/datasources/airtable/course-datasource');
const attachmentDatasource = require('../../../lib/infrastructure/datasources/airtable/attachment-datasource');
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
      sinon.stub(attachmentDatasource, 'list').resolves([]);

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
      sinon.stub(attachmentDatasource, 'list').resolves([]);
      courseDatasource.list = async() => { throw new Error(); };

      //When
      releaseRepository.getCurrentContentAsStream(writableStream);

      //Then
      expect(await releasePromise).to.match(/error$/);
    });
  });

  describe('#assignAttachmentsToChallenges', () => {
    it('assign illustration and attachments to challenge', () => {
      const expectedChallenge = {
        id: 'recChallenge0',
        some: 'property',
        attachments: [ 'url de la pièce jointe' ],
        illustrationAlt: 'Texte alternatif de l\'illustration',
        illustrationUrl: 'url de l\'illustration',
      };

      const attachments = [{
        url: 'url de la pièce jointe',
        challengeId: 'recChallenge0',
        type: 'attachment',
      }, {
        url: 'url de l\'illustration',
        alt: 'Texte alternatif de l\'illustration',
        challengeId: 'recChallenge0',
        type: 'illustration',
      }];

      const challengesWithoutAttachments = [{
        id: 'recChallenge0',
        some: 'property',
      }];

      const challenges = releaseRepository.assignAttachmentsToChallenges(challengesWithoutAttachments, attachments);

      expect(challenges[0]).to.deep.equal(expectedChallenge);
    });

    it('assign multiple attachments to challenge', () => {
      const expectedChallenge = {
        id: 'recChallenge0',
        some: 'property',
        attachments: [ 'url de la pièce jointe', 'url de la pièce jointe 2' ],
      };

      const attachments = [{
        url: 'url de la pièce jointe',
        challengeId: 'recChallenge0',
        type: 'attachment',
      }, {
        url: 'url de la pièce jointe 2',
        challengeId: 'recChallenge0',
        type: 'attachment',
      }];

      const challengesWithoutAttachments = [{
        id: 'recChallenge0',
        some: 'property',
      }];

      const challenges = releaseRepository.assignAttachmentsToChallenges(challengesWithoutAttachments, attachments);

      expect(challenges[0]).to.deep.equal(expectedChallenge);
    });
  });
});

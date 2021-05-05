const { expect, domainBuilder, airtableBuilder, sinon } = require('../../test-helper');
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

  describe('#getCurrentContent', () => {

    it('should return current content', async () => {
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
      const currentContent = await releaseRepository.getCurrentContent();

      //Then
      expect(currentContent).to.deep.equal(expectedCurrentContent);
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

  describe('#serializeEntity', () => {
    it('serialize a challenge and fetch attachments', async () => {
      const challengeDataObject = domainBuilder.buildChallenge({ id: 'recChallenge' });
      const entity = airtableBuilder.factory.buildChallenge({
        id: 'recChallenge',
        instruction: challengeDataObject.instruction,
        alternativeInstruction: challengeDataObject.alternativeInstruction,
        proposals: challengeDataObject.proposals,
        type: challengeDataObject.type,
        solution: challengeDataObject.solution,
        solutionToDisplay: challengeDataObject.solutionToDisplay,
        t1Status: challengeDataObject.t1Status,
        t2Status: challengeDataObject.t2Status,
        t3Status: challengeDataObject.t3Status,
        scoring: challengeDataObject.scoring,
        status: challengeDataObject.status,
        skillIds: challengeDataObject.skills,
        skills: challengeDataObject.skills,
        timer: challengeDataObject.timer,
        illustrationUrl: challengeDataObject.illustrationUrl,
        attachments: challengeDataObject.attachments || [],
        competenceId: challengeDataObject.competenceId,
        embedUrl: challengeDataObject.embedUrl,
        embedTitle: challengeDataObject.embedTitle,
        embedHeight: challengeDataObject.embedHeight,
        illustrationAlt: challengeDataObject.illustrationAlt,
        format: challengeDataObject.format,
        autoReply: challengeDataObject.autoReply,
      });
      const attachment = domainBuilder.buildAttachment({
        id: '1',
        alt: '',
        type: 'illustration',
        url: 'http://example.com/test',
        challengeId: 'recChallenge',
      });
      const type = 'Epreuves';

      sinon.stub(attachmentDatasource, 'filterByChallengeId').withArgs('recChallenge').resolves([attachment]);

      const { updatedRecord, model } = await releaseRepository.serializeEntity({ entity, type });

      expect(updatedRecord.illustrationUrl).to.equal('http://example.com/test');
      expect(model).to.equal('challenges');
    });

    it('serialize an area', async () => {
      const entity = airtableBuilder.factory.buildArea({
        id: '1',
        code: 1,
        color: 'blue',
        name: '1',
        competenceIds: [],
        competenceAirtableIds: [],
        titleFrFr: 'Bonjour',
        titleEnUs: 'Hello',
      });
      const type = 'Domaines';
      sinon.stub(attachmentDatasource, 'filterByChallengeId');
      sinon.stub(challengeDatasource, 'filterById');

      const { updatedRecord, model } = await releaseRepository.serializeEntity({ entity, type });

      expect(updatedRecord).to.deep.equal({
        id: '1',
        code: 1,
        color: 'blue',
        name: '1',
        competenceIds: [],
        competenceAirtableIds: [],
        titleFrFr: 'Bonjour',
        titleEnUs: 'Hello',
      });
      expect(attachmentDatasource.filterByChallengeId).to.not.have.been.called;
      expect(challengeDatasource.filterById).to.not.have.been.called;
      expect(model).to.equal('areas');
    });

    it('serialize attachment', async () => {
      const entity = airtableBuilder.factory.buildAttachment({
        id: 'recAttachment',
        alt: 'texte alternatif à l\'image',
        url: 'http://example.com/test',
        type: 'illustration',
        challengeId: 'recChallenge'
      });
      const attachmentRecords = [
        domainBuilder.buildAttachment({
          id: 'recAttachment2',
          url: 'http://example.com/attachment',
          type: 'attachment',
          challengeId: 'recChallenge'
        }),
        domainBuilder.buildAttachment({
          id: 'recAttachment',
          alt: 'texte alternatif à l\'image',
          url: 'http://example.com/test',
          type: 'illustration',
          challengeId: 'recChallenge'
        }),
      ];

      const challenge = domainBuilder.buildChallenge({
        id: 'recChallenge',
        instruction : 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
        alternativeInstruction : '',
        proposals : '- 1\n- 2\n- 3\n- 4\n- 5',
        type : 'QCM',
        solution : '1, 5',
        solutionToDisplay : '1',
        t1Status : 'Activé',
        t2Status : 'Désactivé',
        t3Status : 'Activé',
        scoring : '1: @outilsTexte2\n2: @outilsTexte4',
        status : 'validé',
        skillIds : ['recUDrCWD76fp5MsE'],
        skills : ['@modèleEco3'],
        timer : 1234,
        competenceId : 'recsvLz0W2ShyfD63',
        embedUrl : 'https://github.io/page/epreuve.html',
        embedTitle : 'Epreuve de selection de dossier',
        embedHeight : 500,
        format : 'mots',
        autoReply : false,
      });
      const type = 'Attachments';

      sinon.stub(challengeDatasource, 'filterById').withArgs('recChallenge').resolves([challenge]);
      sinon.stub(attachmentDatasource, 'filterByChallengeId').withArgs('recChallenge').resolves(attachmentRecords);

      const { updatedRecord, model } = await releaseRepository.serializeEntity({ entity, type });

      expect(updatedRecord.illustrationUrl).to.equal('http://example.com/test');
      expect(updatedRecord.illustrationAlt).to.equal('texte alternatif à l\'image');
      expect(updatedRecord.attachments).to.deep.equal(['http://example.com/attachment']);
      expect(model).to.equal('challenges');
    });
  });
});

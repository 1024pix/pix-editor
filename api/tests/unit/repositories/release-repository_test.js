const { expect, domainBuilder, airtableBuilder, sinon } = require('../../test-helper');
const areaDatasource = require('../../../lib/infrastructure/datasources/airtable/area-datasource');
const competenceDatasource = require('../../../lib/infrastructure/datasources/airtable/competence-datasource');
const tubeDatasource = require('../../../lib/infrastructure/datasources/airtable/tube-datasource');
const skillDatasource = require('../../../lib/infrastructure/datasources/airtable/skill-datasource');
const challengeDatasource = require('../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const tutorialDatasource = require('../../../lib/infrastructure/datasources/airtable/tutorial-datasource');
const courseDatasource = require('../../../lib/infrastructure/datasources/airtable/course-datasource');
const frameworkDatasource = require('../../../lib/infrastructure/datasources/airtable/framework-datasource');
const attachmentDatasource = require('../../../lib/infrastructure/datasources/airtable/attachment-datasource');
const thematicDatasource = require('../../../lib/infrastructure/datasources/airtable/thematic-datasource');
const releaseRepository = require('../../../lib/infrastructure/repositories/release-repository');
const challengeTransformer = require('../../../lib/infrastructure/transformers/challenge-transformer');
const competenceTransformer = require('../../../lib/infrastructure/transformers/competence-transformer');
const skillTransformer = require('../../../lib/infrastructure/transformers/skill-transformer');
const courseTransformer = require('../../../lib/infrastructure/transformers/course-transformer');
const tutorialTransformer = require('../../../lib/infrastructure/transformers/tutorial-transformer');
const Release = require('../../../lib/domain/models/Release');
const Content = require('../../../lib/domain/models/Content');

describe('Unit | Repository | release-repository', () => {

  describe('#getCurrentContent', () => {

    it('should return current content', async () => {
      //Given
      const areas = [];
      const attachments = [];
      const challenges = [];
      const competences = [];
      const courses = [];
      const frameworks = [];
      const skills = [];
      const thematics = [];
      const tubes = [];
      const tutorials = [];
      const transformedCompetences = [Symbol('transformed-competence')];
      const transformedSkills = [Symbol('transformed-skill')];
      const transformedCourses = [Symbol('transformed-course')];
      const transformedTutorials = [Symbol('transformed-tutorial')];
      const expectedCurrentContent = {
        areas: [],
        challenges: [],
        competences: transformedCompetences,
        courses: transformedCourses,
        frameworks: [],
        skills: transformedSkills,
        thematics,
        tubes: [],
        tutorials: transformedTutorials,
      };

      sinon.stub(areaDatasource, 'list').resolves(areas);
      sinon.stub(attachmentDatasource, 'list').resolves(attachments);
      sinon.stub(challengeDatasource, 'list').resolves(challenges);
      sinon.stub(competenceDatasource, 'list').resolves(competences);
      sinon.stub(courseDatasource, 'list').resolves(courses);
      sinon.stub(frameworkDatasource, 'list').resolves(frameworks);
      sinon.stub(skillDatasource, 'list').resolves(skills);
      sinon.stub(thematicDatasource, 'list').resolves(thematics);
      sinon.stub(tubeDatasource, 'list').resolves(tubes);
      sinon.stub(tutorialDatasource, 'list').resolves(tutorials);
      sinon.stub(challengeTransformer, 'createChallengeTransformer').returns(() => {});
      sinon.stub(competenceTransformer, 'filterCompetencesFields').returns(transformedCompetences);
      sinon.stub(skillTransformer, 'filterSkillsFields').returns(transformedSkills);
      sinon.stub(courseTransformer, 'filterCoursesFields').returns(transformedCourses);
      sinon.stub(tutorialTransformer, 'filterTutorialsFields').returns(transformedTutorials);

      //When
      const currentContent = await releaseRepository.getCurrentContent();

      //Then
      expect(currentContent).to.deep.equal(expectedCurrentContent);
      expect(challengeTransformer.createChallengeTransformer).to.have.been.calledWithExactly({
        areas,
        attachments,
        challengesWithoutAttachments: challenges,
        competences,
        courses,
        frameworks,
        skills,
        thematics,
        tubes,
        tutorials
      });
      expect(competenceTransformer.filterCompetencesFields).to.have.been.calledWithExactly(competences);
      expect(skillTransformer.filterSkillsFields).to.have.been.calledWithExactly(skills);
      expect(courseTransformer.filterCoursesFields).to.have.been.calledWithExactly(courses);
      expect(tutorialTransformer.filterTutorialsFields).to.have.been.calledWithExactly(tutorials);
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
        status: challengeDataObject.status,
        skillId: challengeDataObject.skillId,
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
        frameworkId: 'recFramework0',
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
        frameworkId: 'recFramework0',
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
        status : 'validé',
        skillId : 'recUDrCWD76fp5MsE',
        timer : 1234,
        competenceId : 'recsvLz0W2ShyfD63',
        embedUrl : 'https://github.io/page/epreuve.html',
        embedTitle : 'Epreuve de selection de dossier',
        embedHeight : 500,
        format : 'mots',
        autoReply : false,
      });
      const type = 'Attachments';

      sinon.stub(challengeDatasource, 'filterById').withArgs('recChallenge').resolves(challenge);
      sinon.stub(attachmentDatasource, 'filterByChallengeId').withArgs('recChallenge').resolves(attachmentRecords);

      const { updatedRecord, model } = await releaseRepository.serializeEntity({ entity, type });

      expect(updatedRecord.illustrationUrl).to.equal('http://example.com/test');
      expect(updatedRecord.illustrationAlt).to.equal('texte alternatif à l\'image');
      expect(updatedRecord.attachments).to.deep.equal(['http://example.com/attachment']);
      expect(model).to.equal('challenges');
    });
  });

  describe('#toDomain', function() {
    it('should build Release model with given parameters', function() {
      const databaseObjectRelease = {
        id: 123,
        content: {
          areas: [],
          challenges: [],
          competences: [],
          courses: [],
          frameworks: [],
          skills: [],
          thematics: [],
          tubes: [],
          tutorials: [],
        },
        createdAt: '2021-08-31'
      };

      const release = releaseRepository.toDomain(databaseObjectRelease);

      expect(release).to.be.instanceOf(Release);
      expect(release.id).to.equal(databaseObjectRelease.id);
      expect(release.content).to.deep.equal(databaseObjectRelease.content);
      expect(release.content).to.be.instanceOf(Content);
      expect(release.createdAt).to.deep.equal(databaseObjectRelease.createdAt);
    });
  });
});

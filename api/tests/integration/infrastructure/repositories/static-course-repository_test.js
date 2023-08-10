const { expect, databaseBuilder, domainBuilder, sinon } = require('../../../test-helper');
const staticCourseRepository = require('../../../../lib/infrastructure/repositories/static-course-repository');
const challengeDatasource = require('../../../../lib/infrastructure/datasources/airtable/challenge-datasource');
const skillDatasource = require('../../../../lib/infrastructure/datasources/airtable/skill-datasource');

describe('Integration | Repository | static-course-repository', function() {
  context('#getRead', function() {
    it('should return the static course', async function() {
      //given
      databaseBuilder.factory.buildStaticCourse({
        id: 'rec123',
        challengeIds: 'challengeA,challengeB',
      });
      const airtableChallenges = [
        domainBuilder.buildChallengeAirtableDataObject({
          id: 'challengeA',
          instruction: 'instructionA',
          status: 'A',
          skillId: 'skillA',
          preview: 'site/challenges/challengeA',
        }),
        domainBuilder.buildChallengeAirtableDataObject({
          id: 'challengeB',
          instruction: 'instructionB',
          status: 'B',
          skillId: 'skillB',
          preview: 'site/challenges/challengeB',
        }),
      ];
      const stubFilterChallengeDatasource = sinon.stub(challengeDatasource, 'filter');
      stubFilterChallengeDatasource.withArgs({ filter: { ids: ['challengeA', 'challengeB'] } }).resolves(airtableChallenges);
      const stubFilterSkillDatasource = sinon.stub(skillDatasource, 'filter');
      stubFilterSkillDatasource.withArgs({ filter: { ids: ['skillA', 'skillB'] } }).resolves([
        { id: 'skillA', name: '@skillA' }, { id: 'skillB', name: '@skillB' }
      ]);
      await databaseBuilder.commit();

      //when
      const staticCourse = await staticCourseRepository.getRead('rec123');

      //then
      expect(staticCourse.id).to.equal('rec123');
    });
  });
});


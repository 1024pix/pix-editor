const { expect, databaseBuilder, knex, domainBuilder } = require('../../../test-helper');
const releaseRepository = require('../../../../lib/infrastructure/repositories/release-repository');

describe('Integration | Repository | release-repository', function() {

  describe('#create', function() {

    afterEach(function() {
      return knex('releases').delete();
    });

    it('should save current content as a new release', async function() {
      // Given
      const currentContent = { some: 'property' };
      const fakeGetCurrentContent = async function() { return currentContent; };

      // When
      await releaseRepository.create(fakeGetCurrentContent);

      // Then
      const releasesInDb = await knex('releases');
      expect(releasesInDb).to.have.length(1);
      expect(releasesInDb[0].content).to.deep.equal(currentContent);
    });

    it('should return the saved release ID', async function() {
      // Given
      const currentContentDTO = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] };
      const fakeGetCurrentContent = async function() { return currentContentDTO; };

      // When
      const releaseId = await releaseRepository.create(fakeGetCurrentContent);

      // Then
      const [releasesInDbId] = await knex('releases').pluck('id');
      expect(releaseId).to.equal(releasesInDbId);
    });
  });

  describe('#getLatestRelease', function() {
    it('should return content of newest created release', async function() {
      // Given
      const newestReleaseContentDTO = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] };
      const oldestReleaseContentDTO = { some: 'old-property' };
      databaseBuilder.factory.buildRelease({ id: 1, createdAt: new Date('2021-02-02'), content: newestReleaseContentDTO });
      databaseBuilder.factory.buildRelease({ id: 2, createdAt: new Date('2020-01-01'), content: oldestReleaseContentDTO });
      await databaseBuilder.commit();

      // When
      const latestRelease = await releaseRepository.getLatestRelease();

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(newestReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({ id: 1, createdAt: new Date('2021-02-02'), content: expectedContent });
      expect(latestRelease).to.deepEqualInstance(expectedRelease);
    });
  });

  describe('#getRelease', function() {
    it('should return content of given release', async function() {
      // Given
      const otherReleaseContentDTO = { some: 'property' };
      const expectedReleaseContentDTO = { areas: [], challenges: [], competences: [], courses: [], frameworks: [], skills: [], thematics: [], tubes: [], tutorials: [] };

      databaseBuilder.factory.buildRelease({ id: 11, createdAt: new Date('2021-01-01'), content: otherReleaseContentDTO });
      databaseBuilder.factory.buildRelease({ id: 12, createdAt: new Date('2020-01-01'), content: expectedReleaseContentDTO });
      await databaseBuilder.commit();

      // When
      const givenRelease = await releaseRepository.getRelease(12);

      // Then
      const expectedContent = domainBuilder.buildContentForRelease(expectedReleaseContentDTO);
      const expectedRelease = domainBuilder.buildDomainRelease({ id: 12, createdAt: new Date('2020-01-01'), content: expectedContent });
      expect(givenRelease).to.deepEqualInstance(expectedRelease);
    });
  });
});


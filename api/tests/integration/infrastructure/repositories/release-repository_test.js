const { expect, databaseBuilder, knex } = require('../../../test-helper');
const releaseRepository = require('../../../../lib/infrastructure/repositories/release-repository');

describe('Integration | Repository | release-repository', function() {

  describe('#create', function() {
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

    it('should return saved release with id and creation date', async function() {
      // Given
      const currentContent = { areas: [], challenges: [], competences: [], courses: [], skills: [], thematics: [], tubes: [], tutorials: [] };
      const fakeGetCurrentContent = async function() { return currentContent; };

      // When
      const release = await releaseRepository.create(fakeGetCurrentContent);

      // Then
      expect(release.id).to.be.not.null;
      expect(release.createdAt).to.be.instanceOf(Date);
      expect(release.content).to.deep.equal(currentContent);
    });
  });

  describe('#getLatestRelease', function() {
    it('should return content of newest created release', async function() {
      // Given
      const newestReleaseContent = { areas: [], challenges: [], competences: [], courses: [], skills: [], thematics: [], tubes: [], tutorials: [] };
      const oldestReleaseContent = { some: 'old-property' };

      databaseBuilder.factory.buildRelease({ createdAt: '2021-01-01', content: newestReleaseContent });
      databaseBuilder.factory.buildRelease({ createdAt: '2020-01-01', content: oldestReleaseContent });
      await databaseBuilder.commit();

      // When
      const latestRelease = await releaseRepository.getLatestRelease();

      // Then
      expect(latestRelease.content).to.deep.equal(newestReleaseContent);
    });
  });

  describe('#getRelease', function() {
    it('should return content of given release', async function() {
      // Given
      const otherReleaseContent = { some: 'property' };
      const expectedReleaseContent = { areas: [], challenges: [], competences: [], courses: [], skills: [], thematics: [], tubes: [], tutorials: [] };

      databaseBuilder.factory.buildRelease({ id: 11, createdAt: '2021-01-01', content: otherReleaseContent });
      databaseBuilder.factory.buildRelease({ id: 12, createdAt: '2020-01-01', content: expectedReleaseContent });
      await databaseBuilder.commit();

      // When
      const givenRelease = await releaseRepository.getRelease(12);

      // Then
      expect(givenRelease.content).to.deep.equal(expectedReleaseContent);
    });
  });
});


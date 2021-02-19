const { expect, databaseBuilder, knex } = require('../../../test-helper');
const releaseRepository = require('../../../../lib/infrastructure/repositories/release-repository');

describe('Integration | Repository | release-repository', function() {
  describe('#create', () => {
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
      const currentContent = { some: 'property' };
      const fakeGetCurrentContent = async function() { return currentContent; };

      // When
      const release = await releaseRepository.create(fakeGetCurrentContent);

      // Then
      expect(release.id).to.be.not.null;
      expect(release.createdAt).to.be.instanceOf(Date);
      expect(release.content).to.deep.equal(currentContent);
    });
  });

  describe('#getLatestRelease', () => {
    it('should return content of newest created release', async function() {
      // Given
      const newestReleaseContent = { some: 'property' };
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
});


const chai = require('chai');
const expect = chai.expect;
const { findUrlsFromChallenge, findUrlsFromChallenges, buildCsv, getLiveChallenges } = require('.');

describe('Check urls from release', function() {
  describe('#findUrlsFromChallenge', function() {
    it('should not find url from a challenge when there is no url', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions',
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should not find url from a challenge when there is no instructions', function() {
      const challenge = {
        id: 'challenge123',
        instruction: null,
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should find url from a challenge', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions [link](https://example.com/)',
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://example.com/']);
    });

    it('should find url from a markdown link', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions [https://example.com/](https://example.com/)',
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://example.com/']);
    });

    it('should find not find url that are document name', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions report.docx',
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should prepend https in urls if not present', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions www.example.com',
      };
      const urls = findUrlsFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://www.example.com']);
    });

  });

  describe('#findUrlsFromChallenges', function() {
    it('should find urls from challenges', function() {
      const challenges = [
        {
          id: 'challenge1',
          instruction: 'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)',
        },
        {
          id: 'challenge2',
          instruction: 'instructions',
        },
        {
          id: 'challenge3',
          instruction: 'instructions [link](https://example.com/)',
        }
      ];

      const expectedOutput = [
        { id: 'challenge1', url: 'https://example.net/' },
        { id: 'challenge1', url: 'https://other_example.net/' },
        { id: 'challenge3', url: 'https://example.com/' },
      ];

      const urls = findUrlsFromChallenges(challenges);

      expect(urls).to.deep.equal(expectedOutput);
    });
    it('should use challenge that are not outdated', function() {
      const release = {
        challenges : [
          {
            id: 'challenge1',
            status: 'validé'
          },
          {
            id: 'challenge2',
            status: 'proposé'
          },
          {
            id: 'challenge3',
            status: 'périmé'
          }
        ]
      };

      const expectedOutput = [
        {
          id: 'challenge1',
          status: 'validé'
        },
        {
          id: 'challenge2',
          status: 'proposé'
        }
      ];

      const challenges = getLiveChallenges(release);

      expect(challenges).to.deep.equal(expectedOutput);
    });

  });

  describe('#buildCSV', function() {
    it('should build a CSV with the found URLs', function() {
      const urlList = [
        { id: 'challenge1', url: 'https://example.net/' },
        { id: 'challenge1', url: 'https://other_example.net/' },
        { id: 'challenge3', url: 'https://example.com/' },
      ];

      const expectedOutput = `challenge1,https://example.net/
challenge1,https://other_example.net/
challenge3,https://example.com/`;

      const csv = buildCsv(urlList);

      expect(csv).to.equal(expectedOutput);
    });
  });
});

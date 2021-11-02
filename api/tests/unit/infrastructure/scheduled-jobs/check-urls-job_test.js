const chai = require('chai');
const expect = chai.expect;
const {
  findUrlsInMarkdown,
  findUrlsInstructionFromChallenge,
  findUrlsProposalsFromChallenge,
  findUrlsFromChallenges,
  getLiveChallenges,
  findUrlsFromTutorials
} = require('../../../../lib/infrastructure/scheduled-jobs/check-urls-job');

describe('Check urls from release', function() {
  describe('#findUrlsInMarkdown', function() {
    it('should not find url from field value when there is no url', function() {
      const fieldValue = 'instructions';
      const urls = findUrlsInMarkdown(fieldValue);

      expect(urls).to.deep.equal([]);
    });

    it('should find url from a markdown link', function() {
      const fieldValue =  'instructions [https://example.com/](https://example.com/)';
      const urls = findUrlsInMarkdown(fieldValue);

      expect(urls).to.deep.equal(['https://example.com/']);
    });

    it('should find not find url that are document name', function() {
      const fieldValue = 'instructions report.docx';
      const urls = findUrlsInMarkdown(fieldValue);

      expect(urls).to.deep.equal([]);
    });

    it('should prepend https in urls if not present', function() {
      const fieldValue =  'instructions www.example.com';
      const urls = findUrlsInMarkdown(fieldValue);

      expect(urls).to.deep.equal(['https://www.example.com']);
    });
  });

  describe('#findUrlsInstructionFromChallenge', function() {
    it('should not find url from a challenge when there is no instructions', function() {
      const challenge = {
        id: 'challenge123',
        instruction: null,
      };
      const urls = findUrlsInstructionFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should find url instruction from a challenge', function() {
      const challenge = {
        id: 'challenge123',
        instruction: 'instructions [link](https://example.com/)',
      };
      const urls = findUrlsInstructionFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://example.com/']);
    });
  });

  describe('#findUrlsProposalsFromChallenge', function() {
    it('should not find url proposals from a challenge when there is no url', function() {
      const challenge = {
        id: 'challenge123',
        proposals: 'proposals',
      };
      const urls = findUrlsProposalsFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should find url proposals from a challenge', function() {
      const challenge = {
        id: 'challenge123',
        proposals: 'proposals [link](https://example.com/)',
      };
      const urls = findUrlsProposalsFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://example.com/']);
    });
  });

  describe('#findUrlsFromChallenges', function() {
    it('should find urls from challenges', function() {
      const challenges = [
        {
          id: 'challenge1',
          instruction: 'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)',
          proposals: 'proposals [link](https://example.net/)'
        },
        {
          id: 'challenge2',
          instruction: 'instructions',
          proposals: 'proposals [link](https://example.fr/)'
        },
        {
          id: 'challenge3',
          instruction: 'instructions [link](https://example.com/)',
          proposals: 'proposals',
        }
      ];

      const expectedOutput = [
        { id: 'challenge1', url: 'https://example.net/' },
        { id: 'challenge1', url: 'https://other_example.net/' },
        { id: 'challenge2', url: 'https://example.fr/' },
        { id: 'challenge3', url: 'https://example.com/' },
      ];

      const urls = findUrlsFromChallenges(challenges);

      expect(urls).to.deep.equal(expectedOutput);
    });
  });

  describe('#getLiveChallenges', function() {
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

  describe('#findUrlsFromTutorials', function() {
    it('should find urls from tutorials', function() {
      const tutorials = [
        {
          id: 'tutorial1',
          link: 'https://example.net/'
        },
        {
          id: 'tutorial2',
          link: 'https://example.net/'
        },
        {
          id: 'tutorial13',
          link: 'https://example.net/'
        }
      ];

      const exepectedOutput = [
        {
          id: 'tutorial1',
          url: 'https://example.net/'
        },
        {
          id: 'tutorial2',
          url: 'https://example.net/'
        },
        {
          id: 'tutorial13',
          url: 'https://example.net/'
        }
      ];

      const urls = findUrlsFromTutorials(tutorials);

      expect(urls).to.deep.equal(exepectedOutput);
    });
  });
});

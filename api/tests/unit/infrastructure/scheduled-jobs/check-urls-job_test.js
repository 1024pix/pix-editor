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
      const release = {
        skills: [
          {
            id: 'skill1',
            name: '@mySkill1'
          },
          {
            id: 'skill2',
            name: '@mySkill2'
          }
        ]
      };
      const challenges = [
        {
          id: 'challenge1',
          instruction: 'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)',
          proposals: 'proposals [link](https://example.net/)',
          skillIds: ['skill1'],
          status: 'validé',
        },
        {
          id: 'challenge2',
          instruction: 'instructions',
          proposals: 'proposals [link](https://example.fr/)',
          skillIds: [],
          status: 'validé',
        },
        {
          id: 'challenge3',
          instruction: 'instructions [link](https://example.com/)',
          proposals: 'proposals',
          skillIds: ['skill1', 'skill2'],
          status: 'validé',
        }
      ];

      const expectedOutput = [
        { id: '@mySkill1;challenge1;validé', url: 'https://example.net/' },
        { id: '@mySkill1;challenge1;validé', url: 'https://other_example.net/' },
        { id: ';challenge2;validé', url: 'https://example.fr/' },
        { id: '@mySkill1 @mySkill2;challenge3;validé', url: 'https://example.com/' },
      ];

      const urls = findUrlsFromChallenges(challenges, release);

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
      const release = {
        skills: [
          {
            name: '@mySkill1',
            tutorialIds: ['tutorial1', 'tutorial3'],
            learningMoreTutorialIds: [],
          },
          {
            name: '@mySkill2',
            tutorialIds: [],
            learningMoreTutorialIds: ['tutorial3'],
          },
        ],
      };
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
          id: 'tutorial3',
          link: 'https://example.net/'
        }
      ];

      const expectedOutput = [
        {
          id: '@mySkill1;tutorial1',
          url: 'https://example.net/'
        },
        {
          id: ';tutorial2',
          url: 'https://example.net/'
        },
        {
          id: '@mySkill1 @mySkill2;tutorial3',
          url: 'https://example.net/'
        }
      ];

      const urls = findUrlsFromTutorials(tutorials, release);

      expect(urls).to.deep.equal(expectedOutput);
    });
  });
});

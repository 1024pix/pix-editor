import { describe, expect, it } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import {
  findUrlsFromChallenges,
  findUrlsFromTutorials,
  findUrlsInMarkdown,
  findUrlsInstructionFromChallenge,
  findUrlsProposalsFromChallenge,
  findUrlsSolutionFromChallenge,
  findUrlsSolutionToDisplayFromChallenge,
  getOperativeChallenges
} from '../../../../lib/domain/usecases/index.js';

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

  describe('#findUrlsSolutionFromChallenge', function() {
    it('should not find url solution from a challenge when there is no url', function() {
      const challenge = {
        id: 'challenge123',
        solution: 'solution',
      };
      const urls = findUrlsSolutionFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should find url solution from a challenge', function() {
      const challenge = {
        id: 'challenge123',
        solution: 'solution [link](https://example.com/)',
      };
      const urls = findUrlsSolutionFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://example.com/']);
    });
  });

  describe('#findUrlsSolutionToDisplayFromChallenge', function() {
    it('should not find url solution to display from a challenge when there is no url', function() {
      const challenge = {
        id: 'challenge123',
        solutionToDisplay: 'solution to display',
      };
      const urls = findUrlsSolutionToDisplayFromChallenge(challenge);

      expect(urls).to.deep.equal([]);
    });

    it('should find url solution to display from a challenge', function() {
      const challenge = {
        id: 'challenge123',
        solutionToDisplay: 'solution to display [link](https://example.com/)',
      };
      const urls = findUrlsSolutionToDisplayFromChallenge(challenge);

      expect(urls).to.deep.equal(['https://example.com/']);
    });
  });

  describe('#findUrlsFromChallenges', function() {
    it('should find urls from challenges', async function() {
      const localizedChallengesById = {
        'challenge1': domainBuilder.buildLocalizedChallenge({ id: 'challenge1', urlsToConsult: ['http://google.com', 'https://zouzou.fr'] }),
        'challenge2': domainBuilder.buildLocalizedChallenge({ id: 'challenge2', urlsToConsult: ['https://editor.pix.fr'] }),
        'challenge3': domainBuilder.buildLocalizedChallenge({ id: 'challenge3', urlsToConsult: [] }),
        'challenge4': domainBuilder.buildLocalizedChallenge({ id: 'challenge4', urlsToConsult: null }),
        'challenge5': domainBuilder.buildLocalizedChallenge({ id: 'challenge5', urlsToConsult: ['http://alice.hole'] }),
      };
      const release = {
        competences: [
          {
            id: 'competence1',
            origin: 'Pix',
            name_i18n: {
              fr: 'competence 1.1'
            }
          },
          {
            id: 'competence2',
            origin: 'wonderland',
            name_i18n: {
              fr: 'competence 4.5'
            }
          }
        ],
        tubes: [
          {
            id: 'tube1',
            competenceId: 'competence1'
          },
          {
            id: 'tube2',
            competenceId: 'competence2'
          }
        ],
        skills: [
          {
            id: 'skill1',
            tubeId: 'tube1',
            name: '@mySkill1'
          },
          {
            id: 'skill2',
            tubeId: 'tube1',
            name: '@mySkill2'
          },
          {
            id: 'skill23',
            tubeId: 'tube2',
            name: '@mySkill23'
          }
        ]
      };
      const challenges = [
        {
          id: 'challenge1',
          instruction: 'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)',
          proposals: 'proposals [link](https://example.net/)',
          solution: 'solution [link](https://solution_example.net/)',
          skillId: 'skill1',
          status: 'validé',
          locales: ['fr']
        },
        {
          id: 'challenge2',
          instruction: 'instructions',
          proposals: 'proposals [link](https://example.fr/)',
          skillId: undefined,
          status: 'validé',
          locales: ['fr', 'FR-fr']
        },
        {
          id: 'challenge3',
          instruction: 'instructions',
          solutionToDisplay: 'solution to display https://solutionToDisplay_example.org/',
          skillId: 'skill2',
          status: 'validé',
          locales: ['en']
        },
        {
          id: 'challenge4',
          instruction: 'instructions',
          solutionToDisplay: 'solution to display https://solution_challenge4.org/',
          skillId: 'skill2',
          status: 'validé',
          locales: ['fr']
        },
        {
          id: 'challenge5',
          instruction: 'instructions',
          solutionToDisplay: '',
          skillId: 'skill23',
          status: 'validé',
          locales: ['nl']
        }
      ];

      const expectedOutput = [
        { id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr', url: 'https://example.net/' },
        { id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr', url: 'https://other_example.net/' },
        { id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr', url: 'https://solution_example.net/' },
        { id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr', url: 'http://google.com' },
        { id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr', url: 'https://zouzou.fr' },
        { id: ';;;challenge2;validé;fr', url: 'https://example.fr/' },
        { id: ';;;challenge2;validé;fr', url: 'https://editor.pix.fr' },
        { id: 'Pix;competence 1.1;@mySkill2;challenge3;validé;en', url: 'https://solutionToDisplay_example.org/' },
        { id: 'Pix;competence 1.1;@mySkill2;challenge4;validé;fr', url: 'https://solution_challenge4.org/' },
        { id: 'wonderland;competence 4.5;@mySkill23;challenge5;validé;nl', url: 'http://alice.hole' },
      ];

      const urls = findUrlsFromChallenges(challenges, release, localizedChallengesById);
      expect(urls).to.deep.equal(expectedOutput);
    });
  });

  describe('#getOperativeChallenges', function() {
    it('should list challenges that are not outdated or proposed', function() {
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
          },
          {
            id: 'challenge4',
            status: 'archivé'
          },
        ]
      };

      const expectedOutput = [
        {
          id: 'challenge1',
          status: 'validé'
        },
        {
          id: 'challenge4',
          status: 'archivé'
        }
      ];

      const challenges = getOperativeChallenges(release);

      expect(challenges).to.deep.equal(expectedOutput);
    });

  });

  describe('#findUrlsFromTutorials', function() {
    it('should find urls from tutorials', function() {
      const release = {
        competences: [
          {
            id: 'competence1',
            name_i18n: {
              fr: 'competence 1.1'
            }
          },
          {
            id: 'competence2',
            name_i18n: {
              fr: 'competence 1.2'
            }
          }
        ],
        tubes: [
          {
            id: 'tube1',
            competenceId: 'competence1'
          },
          {
            id: 'tube2',
            competenceId: 'competence2'
          }
        ],
        skills: [
          {
            name: '@mySkill1',
            tubeId: 'tube1',
            tutorialIds: ['tutorial1', 'tutorial3'],
            learningMoreTutorialIds: [],
          },
          {
            name: '@mySkill2',
            tubeId: 'tube2',
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
          id: 'competence 1.1;@mySkill1;tutorial1',
          url: 'https://example.net/'
        },
        {
          id: ';;tutorial2',
          url: 'https://example.net/'
        },
        {
          id: 'competence 1.1 competence 1.2;@mySkill1 @mySkill2;tutorial3',
          url: 'https://example.net/'
        }
      ];

      const urls = findUrlsFromTutorials(tutorials, release);

      expect(urls).to.deep.equal(expectedOutput);
    });
  });
});

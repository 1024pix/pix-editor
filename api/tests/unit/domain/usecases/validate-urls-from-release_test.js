import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';
import { validateUrlsFromRelease } from '../../../../lib/domain/usecases/index.js';
import { UrlUtils } from '../../../../lib/infrastructure/utils/url-utils.js';

describe('Unit | Domain | Usecases | Validate urls from release', function() {
  describe('#validateUrlsFromRelease', function() {
    let releaseRepository, urlRepository, localizedChallengeRepository, mockedUrlUtils;
    const identifiedUrlChallenge1_1 = {
      id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr',
      url: 'https://example.net/',
    };
    const identifiedUrlChallenge1_2 = {
      id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr',
      url: 'https://other_example.net/',
    };
    const identifiedUrlChallenge1_3 = {
      id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr',
      url: 'https://solution_example.net/',
    };
    const identifiedUrlChallenge1_4 = {
      id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr',
      url: 'http://google.com',
    };
    const identifiedUrlChallenge1_5 = {
      id: 'Pix;competence 1.1;@mySkill1;challenge1;validé;fr',
      url: 'https://zouzou.fr',
    };
    const identifiedUrlChallenge2_1 = {
      id: ';;;challenge2;archivé;fr',
      url: 'https://example.fr/',
    };
    const identifiedUrlChallenge2_2 = {
      id: ';;;challenge2;archivé;fr',
      url: 'https://editor.pix.fr',
    };
    const identifiedUrlChallenge3_1 = {
      id: 'Pix;competence 1.1;@mySkill2;challenge3;validé;en',
      url: 'https://solutionToDisplay_example.org/',
    };
    const identifiedUrlChallenge4_1 = {
      id: 'Pix;competence 1.1;@mySkill2;challenge4;archivé;fr',
      url: 'https://solution_challenge4.org/'
    };
    const identifiedUrlChallenge5_1 = {
      id: 'wonderland;competence 4.5;@mySkill23;challenge5;validé;nl',
      url: 'http://alice.hole',
    };
    const identifiedTutorial1 = {
      id: 'competence 1.1;@mySkill1;tutorial1',
      url: 'https://tuto1.net/',
    };
    const identifiedTutorial2 = {
      id: 'competence 4.5;@mySkill23;tutorial2',
      url: 'https://tuto2.net/',
    };
    const identifiedTutorial3 = {
      id: 'competence 1.1;@mySkill1;tutorial3',
      url: 'https://tuto3.net/',
    };

    beforeEach(function() {
      const pixCompetence = domainBuilder.buildCompetenceForRelease({
        id: 'competence1',
        origin: 'Pix',
        name_i18n: {
          fr: 'competence 1.1'
        },
      });
      const wonderlandCompetence = domainBuilder.buildCompetenceForRelease({
        id: 'competence2',
        origin: 'wonderland',
        name_i18n: {
          fr: 'competence 4.5'
        },
      });
      const pixTube =  domainBuilder.buildTubeForRelease({
        id: 'tube1',
        competenceId: 'competence1',
      });
      const wonderlandTube =  domainBuilder.buildTubeForRelease({
        id: 'tube2',
        competenceId: 'competence2',
      });
      const pixSkill1 = domainBuilder.buildSkillForRelease({
        id: 'skill1',
        tubeId: 'tube1',
        name: '@mySkill1',
        tutorialIds: ['tutorial1', 'tutorial3'],
        learningMoreTutorialIds: [],
      });
      const pixSkill2 = domainBuilder.buildSkillForRelease({
        id: 'skill2',
        tubeId: 'tube1',
        name: '@mySkill2',
        tutorialIds: [],
        learningMoreTutorialIds: [],
      });
      const wonderlandSkill1 = domainBuilder.buildSkillForRelease({
        id: 'skill23',
        tubeId: 'tube2',
        name: '@mySkill23',
        tutorialIds: [],
        learningMoreTutorialIds: ['tutorial2'],
      });
      const tutorials = [
        domainBuilder.buildTutorialForRelease({ id: 'tutorial1', link: 'https://tuto1.net/' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial2', link: 'https://tuto2.net/' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial3', link: 'https://tuto3.net/' }),
      ];
      const pixChallenge1Skill1 = domainBuilder.buildChallengeForRelease({
        id: 'challenge1',
        instruction: 'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)',
        proposals: 'proposals [link](https://example.net/)',
        solution: 'solution [link](https://solution_example.net/)',
        skillId: 'skill1',
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['fr'],
      });
      const challenge2NoSkill = domainBuilder.buildChallengeForRelease({
        id: 'challenge2',
        instruction: 'instructions',
        proposals: 'proposals [link](https://example.fr/)',
        skillId: undefined,
        status: ChallengeForRelease.STATUSES.ARCHIVE,
        locales: ['fr', 'FR-fr'],
      });
      const pixChallenge3Skill2 = domainBuilder.buildChallengeForRelease({
        id: 'challenge3',
        instruction: 'instructions',
        solutionToDisplay: 'solution to display https://solutionToDisplay_example.org/',
        skillId: 'skill2',
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['en'],
      });
      const pixChallenge4Skill2 = domainBuilder.buildChallengeForRelease({
        id: 'challenge4',
        instruction: 'instructions',
        solutionToDisplay: 'solution to display https://solution_challenge4.org/',
        skillId: 'skill2',
        status: ChallengeForRelease.STATUSES.ARCHIVE,
        locales: ['fr'],
      });
      const wonderlandChallenge5Skill23 = domainBuilder.buildChallengeForRelease({
        id: 'challenge5',
        instruction: 'instructions',
        solutionToDisplay: '',
        skillId: 'skill23',
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['nl'],
      });
      const wonderlandChallenge6Skill23 = domainBuilder.buildChallengeForRelease({
        id: 'challenge6',
        instruction: 'instructions',
        solutionToDisplay: 'solution to display https://solution_challenge6.org/',
        skillId: 'skill23',
        status: ChallengeForRelease.STATUSES.PROPOSE,
        locales: ['nl'],
      });
      const wonderlandChallenge7Skill23 = domainBuilder.buildChallengeForRelease({
        id: 'challenge7',
        instruction: 'instructions',
        solutionToDisplay: 'solution to display https://solution_challenge7.org/',
        skillId: 'skill23',
        status: ChallengeForRelease.STATUSES.PERIME,
        locales: ['nl'],
      });
      const latestRelease = domainBuilder.buildDomainRelease.withContent({
        competencesFromRelease: [pixCompetence, wonderlandCompetence],
        tubesFromRelease: [pixTube, wonderlandTube],
        skillsFromRelease: [pixSkill1, pixSkill2, wonderlandSkill1],
        challengesFromRelease: [pixChallenge1Skill1, challenge2NoSkill, pixChallenge3Skill2,
          pixChallenge4Skill2, wonderlandChallenge5Skill23, wonderlandChallenge6Skill23,wonderlandChallenge7Skill23],
        tutorialsFromRelease: tutorials,
      });
      releaseRepository = { getLatestRelease: vi.fn().mockResolvedValue(latestRelease) };
      const localizedChallenges = [
        domainBuilder.buildLocalizedChallenge({ id: 'challenge1', urlsToConsult: ['http://google.com', 'https://zouzou.fr'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge2', urlsToConsult: ['https://editor.pix.fr'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge3', urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge4', urlsToConsult: null }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge5', urlsToConsult: ['http://alice.hole'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge6', urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge7', urlsToConsult: [] }),
      ];
      localizedChallengeRepository = { list: vi.fn().mockResolvedValue(localizedChallenges) };
      urlRepository = {
        updateChallenges: vi.fn(),
        updateTutorials: vi.fn(),
      };
      mockedUrlUtils = {
        findUrlsInMarkdown: UrlUtils.findUrlsInMarkdown,
        analyzeIdentifiedUrls: vi.fn().mockResolvedValue('yo'),
      };
    });

    it('should analyze and update KO urls data from tutorials and operative challenges', async function() {
      // given
      mockedUrlUtils.analyzeIdentifiedUrls
        // mocking for challenges
        .mockResolvedValueOnce([
          {
            id: identifiedUrlChallenge1_1.id,
            url: identifiedUrlChallenge1_1.url,
            status: 'KO',
            error: 'HTTP_ERROR',
            comments: 'identifiedUrlChallenge1_1 HTTP_ERROR',
          },
          {
            id: identifiedUrlChallenge1_2.id,
            url: identifiedUrlChallenge1_2.url,
            status: 'KO',
            error: 'FORMAT_ERROR',
            comments: 'identifiedUrlChallenge1_2 FORMAT_ERROR',
          },
          {
            id: identifiedUrlChallenge1_3.id,
            url: identifiedUrlChallenge1_3.url,
            status: 'OK',
            error: '',
            comments: '',
          },
          {
            id: identifiedUrlChallenge1_4.id,
            url: identifiedUrlChallenge1_4.url,
            status: 'KO',
            error: 'HTTP_ERROR',
            comments: 'identifiedUrlChallenge1_4 HTTP_ERROR',
          },
          {
            id: identifiedUrlChallenge1_5.id,
            url: identifiedUrlChallenge1_5.url,
            status: 'KO',
            error: 'FORMAT_ERROR',
            comments: 'identifiedUrlChallenge1_5 FORMAT_ERROR',
          },
          {
            id: identifiedUrlChallenge2_1.id,
            url: identifiedUrlChallenge2_1.url,
            status: 'KO',
            error: 'HTTP_ERROR',
            comments: 'identifiedUrlChallenge2_1 HTTP_ERROR',
          },
          {
            id: identifiedUrlChallenge2_2.id,
            url: identifiedUrlChallenge2_2.url,
            status: 'OK',
            error: '',
            comments: '',
          },
          {
            id: identifiedUrlChallenge3_1.id,
            url: identifiedUrlChallenge3_1.url,
            status: 'OK',
            error: '',
            comments: '',
          },
          {
            id: identifiedUrlChallenge4_1.id,
            url: identifiedUrlChallenge4_1.url,
            status: 'OK',
            error: '',
            comments: '',
          },
          {
            id: identifiedUrlChallenge5_1.id,
            url: identifiedUrlChallenge5_1.url,
            status: 'KO',
            error: 'HTTP_ERROR',
            comments: 'identifiedUrlChallenge5_1 HTTP_ERROR',
          },
        ])
        // mocking for tutorials
        .mockResolvedValueOnce([
          {
            id: identifiedTutorial1.id,
            url: identifiedTutorial1.url,
            status: 'KO',
            error: 'HTTP_ERROR',
            comments: 'identifiedTutorial1 HTTP_ERROR',
          },
          {
            id: identifiedTutorial2.id,
            url: identifiedTutorial2.url,
            status: 'KO',
            error: 'FORMAT_ERROR',
            comments: 'identifiedTutorial2 identifiedTutorial2',
          },
          {
            id: identifiedTutorial3.id,
            url: identifiedTutorial3.url,
            status: 'OK',
            error: '',
            comments: '',
          },
        ]);

      // when
      await validateUrlsFromRelease({ releaseRepository, urlRepository, localizedChallengeRepository, UrlUtils: mockedUrlUtils });

      // then
      expect(mockedUrlUtils.analyzeIdentifiedUrls.mock.calls[0]).toStrictEqual([[identifiedUrlChallenge1_1, identifiedUrlChallenge1_2, identifiedUrlChallenge1_3, identifiedUrlChallenge1_4, identifiedUrlChallenge1_5, identifiedUrlChallenge2_1, identifiedUrlChallenge2_2, identifiedUrlChallenge3_1, identifiedUrlChallenge4_1, identifiedUrlChallenge5_1 ]]);
      expect(mockedUrlUtils.analyzeIdentifiedUrls.mock.calls[1]).toStrictEqual([[identifiedTutorial1, identifiedTutorial2, identifiedTutorial3 ]]);
      expect(urlRepository.updateChallenges).toHaveBeenCalledTimes(1);
      expect(urlRepository.updateChallenges).toHaveBeenCalledWith([[
        'Pix',
        'competence 1.1',
        '@mySkill1',
        'challenge1',
        'validé',
        'fr',
        'https://example.net/',
        'KO',
        'HTTP_ERROR',
        'identifiedUrlChallenge1_1 HTTP_ERROR',
      ],
      [
        'Pix',
        'competence 1.1',
        '@mySkill1',
        'challenge1',
        'validé',
        'fr',
        'https://other_example.net/',
        'KO',
        'FORMAT_ERROR',
        'identifiedUrlChallenge1_2 FORMAT_ERROR',
      ],
      [
        'Pix',
        'competence 1.1',
        '@mySkill1',
        'challenge1',
        'validé',
        'fr',
        'http://google.com',
        'KO',
        'HTTP_ERROR',
        'identifiedUrlChallenge1_4 HTTP_ERROR',
      ],
      [
        'Pix',
        'competence 1.1',
        '@mySkill1',
        'challenge1',
        'validé',
        'fr',
        'https://zouzou.fr',
        'KO',
        'FORMAT_ERROR',
        'identifiedUrlChallenge1_5 FORMAT_ERROR',
      ],
      [
        '',
        '',
        '',
        'challenge2',
        'archivé',
        'fr',
        'https://example.fr/',
        'KO',
        'HTTP_ERROR',
        'identifiedUrlChallenge2_1 HTTP_ERROR',
      ],
      [
        'wonderland',
        'competence 4.5',
        '@mySkill23',
        'challenge5',
        'validé',
        'nl',
        'http://alice.hole',
        'KO',
        'HTTP_ERROR',
        'identifiedUrlChallenge5_1 HTTP_ERROR',
      ]
      ]);
      expect(urlRepository.updateTutorials).toHaveBeenCalledTimes(1);
      expect(urlRepository.updateTutorials).toHaveBeenCalledWith([[
        'competence 1.1',
        '@mySkill1',
        'tutorial1',
        'https://tuto1.net/',
        'KO',
        'HTTP_ERROR',
        'identifiedTutorial1 HTTP_ERROR',
      ],
      [
        'competence 4.5',
        '@mySkill23',
        'tutorial2',
        'https://tuto2.net/',
        'KO',
        'FORMAT_ERROR',
        'identifiedTutorial2 identifiedTutorial2',
      ]
      ]);
    });
  });
});

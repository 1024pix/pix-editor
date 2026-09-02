import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { ChallengeForRelease, SkillForRelease } from '../../../../lib/domain/models/release/index.js';
import { saveUrlsFromRelease } from '../../../../lib/domain/usecases/index.js';
import * as UrlUtils from '../../../../lib/infrastructure/utils/url-utils.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';
import * as brokenUrlRepository from '../../../../lib/infrastructure/repositories/broken-url-repository.js';
import * as urlRepository from '../../../../lib/infrastructure/repositories/url-repository.js';
import * as whitelistedUrlRepository from '../../../../lib/infrastructure/repositories/whitelisted-url-repository.js';

describe('Integration | Domain | Usecases | Save urls from release', function() {
  describe('#saveUrlsFromRelease', function() {
    let releaseRepository, localizedChallengeRepository;

    beforeEach(async function() {
      const pixCompetence = domainBuilder.buildCompetenceForRelease({
        id: 'competence1',
        origin: 'Pix',
        name_i18n: { fr: 'competence 1.1' },
      });
      const pixCompetence2 = domainBuilder.buildCompetenceForRelease({
        id: 'competence3',
        origin: 'Pix',
        name_i18n: { fr: 'competence 1.3' },
      });
      const wonderlandCompetence = domainBuilder.buildCompetenceForRelease({
        id: 'competence2',
        origin: 'wonderland',
        name_i18n: { fr: 'competence 4.5' },
      });
      const pixSkill1 = domainBuilder.buildSkillForRelease({
        id: 'skill1',
        competenceId: 'competence1',
        name: '@mySkill1',
        tutorialIds: ['tutorial1', 'tutorial3'],
        learningMoreTutorialIds: [],
      });
      const pixSkill2 = domainBuilder.buildSkillForRelease({
        id: 'skill2',
        competenceId: 'competence1',
        name: '@mySkill2',
        tutorialIds: [],
        learningMoreTutorialIds: [],
      });
      const obsoletePixSkill = domainBuilder.buildSkillForRelease({
        id: 'skill3',
        competenceId: 'competence3',
        name: '@mySkill3',
        tutorialIds: ['tutorial1', 'tutorial4'],
        learningMoreTutorialIds: ['tutorial5'],
        status: SkillForRelease.STATUSES.PERIME,
      });
      const wonderlandSkill1 = domainBuilder.buildSkillForRelease({
        id: 'skill23',
        competenceId: 'competence2',
        name: '@mySkill23',
        tutorialIds: [],
        learningMoreTutorialIds: ['tutorial2', 'tutorial7'],
      });
      const tutorials = [
        domainBuilder.buildTutorialForRelease({ id: 'tutorial1', link: 'https://tuto1.net/' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial2', link: 'www.tuto2.net/' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial3', link: 'https://tuto3.net/' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial4', link: 'https://tuto4.net/' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial5', link: 'https://tuto5.net/' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial6', link: 'https://drive.google.fr/drive/folders/totalement_inventé' }),
        domainBuilder.buildTutorialForRelease({ id: 'tutorial7', link: 'https://tuto3.net/', title: 'Le même lien que tutorial3' }),
      ];
      tutorials.forEach((tutorial) => databaseBuilder.factory.buildTutorial(tutorial));
      const pixChallenge1Skill1 = domainBuilder.buildChallengeForRelease({
        id: 'challenge1',
        instruction:
          'instructions [link](https://example.net/) further instructions [other_link](https://other_example.net/)',
        proposals: 'proposals [link](https://example.net/)',
        solution: 'solution https://solution_example.net',
        skillId: 'skill1',
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['fr'],
      });
      const pixChallenge2Skill1 = domainBuilder.buildChallengeForRelease({
        id: 'challenge1bis',
        instruction:
          'instructions [link](https://solution_example.net)',
        skillId: 'skill1',
        status: ChallengeForRelease.STATUSES.ARCHIVE,
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
        instruction: 'instructions https://ignorez-moi.fr',
        solutionToDisplay: 'https://ignore-me.us/some-page',
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
      const wonderlandChallenge8Skill23 = domainBuilder.buildChallengeForRelease({
        id: 'challenge8',
        instruction:
          'instructions [link](https://solution_example.net) further instructions',
        skillId: 'skill23',
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['fr'],
      });
      const challengesForRelease = [
        pixChallenge1Skill1,
        pixChallenge2Skill1,
        challenge2NoSkill,
        pixChallenge3Skill2,
        pixChallenge4Skill2,
        wonderlandChallenge5Skill23,
        wonderlandChallenge6Skill23,
        wonderlandChallenge7Skill23,
        wonderlandChallenge8Skill23,
      ];
      const latestRelease = domainBuilder.buildDomainRelease.withContent({
        competencesFromRelease: [
          pixCompetence,
          pixCompetence2,
          wonderlandCompetence,
        ],
        skillsFromRelease: [
          pixSkill1,
          pixSkill2,
          obsoletePixSkill,
          wonderlandSkill1,
        ],
        challengesFromRelease: challengesForRelease,
        tutorialsFromRelease: tutorials,
      });
      releaseRepository = { getLatestRelease: vi.fn().mockResolvedValue(latestRelease) };

      const challenges = challengesForRelease.map(transformChallengeForReleaseToBarebonesChallenge)
        .map((challenge) => databaseBuilder.factory.buildChallenge(challenge));
      const localizedChallenges = [
        domainBuilder.buildLocalizedChallenge({
          id: 'challenge1',
          challengeId: challenges[0].id,
          urlsToConsult: ['http://google.com', 'https://zouzou.fr'],
        }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge1bis', challengeId: challenges[1].id, urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge2', challengeId: challenges[2].id, urlsToConsult: ['https://editor.pix.fr'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge3', challengeId: challenges[3].id, urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge4', challengeId: challenges[4].id, urlsToConsult: null }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge5', challengeId: challenges[5].id, urlsToConsult: ['http://alice.hole'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge6', challengeId: challenges[6].id, urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge7', challengeId: challenges[7].id, urlsToConsult: ['https://fr.wikipedia.org/wiki/Écriture_collaborative'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge8', challengeId: challenges[8].id, urlsToConsult: [] }),
      ];
      localizedChallenges.forEach((localizedChallenge) => databaseBuilder.factory.buildLocalizedChallenge(localizedChallenge));
      localizedChallengeRepository = { list: vi.fn().mockResolvedValue(localizedChallenges) };

      databaseBuilder.factory.buildWhitelistedUrl({
        url: 'https://ignorez-moi.fr',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        deletedAt: null,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        url: 'https://ignore-me.us',
        checkType: WhitelistedUrl.CHECK_TYPES.STARTS_WITH,
        deletedAt: null,
      });
      databaseBuilder.factory.buildWhitelistedUrl({
        url: 'https://example.net/',
        checkType: WhitelistedUrl.CHECK_TYPES.EXACT_MATCH,
        deletedAt: new Date('2020-01-01'),
      });

      await databaseBuilder.commit();
    });

    it('should analyze and update KO urls data from tutorials and operative challenges', async function() {
      // given
      databaseBuilder.factory.buildExternalUrl({ tutorialIds: ['tutorial1'], localizedChallengeIds: [] });

      const domainNamesToExclude = ['google.fr', 'wikipedia.org'];

      // in release
      const brokenUrl1 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://tuto1.net/' });
      const brokenUrl2 = databaseBuilder.factory.buildBrokenUrl({ url: 'https://solution_example.net' });
      // not in release
      databaseBuilder.factory.buildBrokenUrl({ url: 'https://soon-to-be-deleted.com' });

      await databaseBuilder.commit();

      // when
      await saveUrlsFromRelease({
        brokenUrlRepository,
        releaseRepository,
        urlRepository,
        localizedChallengeRepository,
        whitelistedUrlRepository,
        UrlUtils,
        domainNamesToExclude,
      });

      // then
      const externalUrls = await knex('external_urls');
      const localizedChallengeUrlRelations = await knex('external_urls-localized_challenges');
      const tutorialUrlRelations = await knex('external_urls-tutorials');
      const brokenUrls = await knex('broken_urls').pluck('url');

      expect(externalUrls).toStrictEqual([
        {
          id: expect.any(Number),
          url: 'https://example.net/',
        },
        {
          id: expect.any(Number),
          url: 'https://other_example.net/',
        },
        {
          id: expect.any(Number),
          url: 'https://solution_example.net',
        },
        {
          id: expect.any(Number),
          url: 'http://google.com',
        },
        {
          id: expect.any(Number),
          url: 'https://zouzou.fr',
        },
        {
          id: expect.any(Number),
          url: 'https://example.fr/',
        },
        {
          id: expect.any(Number),
          url: 'https://editor.pix.fr',
        },
        {
          id: expect.any(Number),
          url: 'https://solutionToDisplay_example.org/',
        },
        {
          id: expect.any(Number),
          url: 'https://solution_challenge4.org/',
        },
        {
          id: expect.any(Number),
          url: 'http://alice.hole',
        },
        {
          id: expect.any(Number),
          url: 'https://tuto1.net/',
        },
        {
          id: expect.any(Number),
          url: 'https://www.tuto2.net/',
        },
        {
          id: expect.any(Number),
          url: 'https://tuto3.net/',
        },
      ]);
      expect(localizedChallengeUrlRelations).toHaveLength(12);
      expect(tutorialUrlRelations).toHaveLength(4);
      expect(brokenUrls).toStrictEqual([brokenUrl1.url, brokenUrl2.url]);
    });
  });
});

/**
 *
 * @param {*} challengeForRelease
 * @returns {Parameters<typeof databaseBuilder.factory.buildChallenge>[0]}
 */
function transformChallengeForReleaseToBarebonesChallenge(challengeForRelease) {
  return {
    id: challengeForRelease.id,
    genealogy: challengeForRelease.genealogy,
    contextualizedField: [],
  };
}

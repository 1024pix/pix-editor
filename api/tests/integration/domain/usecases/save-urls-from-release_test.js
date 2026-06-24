import { beforeEach, describe, expect, it, vi } from 'vitest';
import { databaseBuilder, domainBuilder, knex } from '../../../test-helper.js';
import { ChallengeForRelease, SkillForRelease } from '../../../../lib/domain/models/release/index.js';
import { saveUrlsFromRelease } from '../../../../lib/domain/usecases/index.js';
import * as UrlUtils from '../../../../lib/infrastructure/utils/url-utils.js';
import { WhitelistedUrl } from '../../../../lib/domain/models/index.js';
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
        challengesFromRelease: [
          pixChallenge1Skill1,
          pixChallenge2Skill1,
          challenge2NoSkill,
          pixChallenge3Skill2,
          pixChallenge4Skill2,
          wonderlandChallenge5Skill23,
          wonderlandChallenge6Skill23,
          wonderlandChallenge7Skill23,
          wonderlandChallenge8Skill23,
        ],
        tutorialsFromRelease: tutorials,
      });
      releaseRepository = { getLatestRelease: vi.fn().mockResolvedValue(latestRelease) };
      const localizedChallenges = [
        domainBuilder.buildLocalizedChallenge({
          id: 'challenge1',
          urlsToConsult: ['http://google.com', 'https://zouzou.fr'],
        }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge1bis', urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge2', urlsToConsult: ['https://editor.pix.fr'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge3', urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge4', urlsToConsult: null }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge5', urlsToConsult: ['http://alice.hole'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge6', urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge7', urlsToConsult: ['https://fr.wikipedia.org/wiki/Écriture_collaborative'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge8', urlsToConsult: [] }),
      ];
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
      databaseBuilder.factory.buildChallengeExternalUrl();
      databaseBuilder.factory.buildTutorialExternalUrl();
      const domainNamesToExclude = ['google.fr', 'wikipedia.org'];

      await databaseBuilder.commit();

      // when
      await saveUrlsFromRelease({
        releaseRepository,
        urlRepository,
        localizedChallengeRepository,
        whitelistedUrlRepository,
        UrlUtils,
        domainNamesToExclude,
      });

      // then
      const challengeUrls = await knex('challenge_external_urls');
      const tutorialUrls = await knex('tutorial_external_urls');

      expect(challengeUrls).toStrictEqual([
        {
          id: expect.any(Number),
          challenge_status: 'validé',
          framework_name: 'Pix',
          competence_name: 'competence 1.1',
          skill_name: '@mySkill1',
          challenge_id: 'challenge1',
          locale: 'fr',
          url: 'https://example.net/',
        },
        {
          id: expect.any(Number),
          challenge_status: 'validé',
          framework_name: 'Pix',
          competence_name: 'competence 1.1',
          skill_name: '@mySkill1',
          challenge_id: 'challenge1',
          locale: 'fr',
          url: 'https://other_example.net/',
        },
        {
          id: expect.any(Number),
          challenge_status: 'validé, archivé',
          framework_name: 'Pix, wonderland',
          competence_name: 'competence 1.1, competence 4.5',
          skill_name: '@mySkill1, @mySkill23',
          challenge_id: 'challenge1, challenge1bis, challenge8',
          locale: 'fr',
          url: 'https://solution_example.net',
        },
        {
          id: expect.any(Number),
          challenge_status: 'validé',
          framework_name: 'Pix',
          competence_name: 'competence 1.1',
          skill_name: '@mySkill1',
          challenge_id: 'challenge1',
          locale: 'fr',
          url: 'http://google.com',
        },
        {
          id: expect.any(Number),
          challenge_status: 'validé',
          framework_name: 'Pix',
          competence_name: 'competence 1.1',
          skill_name: '@mySkill1',
          challenge_id: 'challenge1',
          locale: 'fr',
          url: 'https://zouzou.fr',
        },
        {
          id: expect.any(Number),
          framework_name: '',
          competence_name: '',
          skill_name: '',
          challenge_id: 'challenge2',
          challenge_status: 'archivé',
          locale: 'fr',
          url: 'https://example.fr/',
        },
        {
          id: expect.any(Number),
          framework_name: '',
          competence_name: '',
          skill_name: '',
          challenge_id: 'challenge2',
          challenge_status: 'archivé',
          locale: 'fr',
          url: 'https://editor.pix.fr',
        },
        {
          id: expect.any(Number),
          framework_name: 'Pix',
          competence_name: 'competence 1.1',
          skill_name: '@mySkill2',
          challenge_id: 'challenge3',
          challenge_status: 'validé',
          locale: 'en',
          url: 'https://solutionToDisplay_example.org/',
        },
        {
          id: expect.any(Number),
          framework_name: 'Pix',
          competence_name: 'competence 1.1',
          skill_name: '@mySkill2',
          challenge_id: 'challenge4',
          challenge_status: 'archivé',
          locale: 'fr',
          url: 'https://solution_challenge4.org/',
        },
        {
          id: expect.any(Number),
          framework_name: 'wonderland',
          competence_name: 'competence 4.5',
          skill_name: '@mySkill23',
          challenge_id: 'challenge5',
          challenge_status: 'validé',
          locale: 'nl',
          url: 'http://alice.hole',
        },
      ]);
      expect(tutorialUrls).toStrictEqual([
        {
          id: expect.any(Number),
          competence_name: 'competence 1.1',
          skill_name: '@mySkill1',
          tutorial_id: 'tutorial1',
          url: 'https://tuto1.net/',
        },
        {
          id: expect.any(Number),
          competence_name: 'competence 4.5',
          skill_name: '@mySkill23',
          tutorial_id: 'tutorial2',
          url: 'https://www.tuto2.net/',
        },
        {
          id: expect.any(Number),
          competence_name: 'competence 1.1, competence 4.5',
          skill_name: '@mySkill1, @mySkill23',
          tutorial_id: 'tutorial3, tutorial7',
          url: 'https://tuto3.net/',
        },
      ]);
    });
  });
});

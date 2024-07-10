import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';
import { exportExternalUrlsFromRelease } from '../../../../lib/domain/usecases/index.js';
import * as UrlUtils from '../../../../lib/infrastructure/utils/url-utils.js';

describe('Unit | Domain | Usecases | Export external urls from release', function() {
  describe('#exportExternalUrlsFromRelease', function() {
    let releaseRepository, urlRepository, localizedChallengeRepository;

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
        name: '@NomTube1',
        competenceId: 'competence1',
      });
      const wonderlandTube =  domainBuilder.buildTubeForRelease({
        id: 'tube2',
        name: '@NomTube2',
        competenceId: 'competence2',
      });
      const pixSkill1 = domainBuilder.buildSkillForRelease({
        id: 'skill1',
        tubeId: 'tube1',
        name: '@mySkill1',
      });
      const pixSkill2 = domainBuilder.buildSkillForRelease({
        id: 'skill2',
        tubeId: 'tube1',
        name: '@mySkill2',
      });
      const wonderlandSkill1 = domainBuilder.buildSkillForRelease({
        id: 'skill23',
        tubeId: 'tube2',
        name: '@mySkill23',
      });
      const pixChallenge1Skill1 = domainBuilder.buildChallengeForRelease({
        id: 'challenge1',
        instruction: 'instructions [link](https://examplechal1.net/) further instructions [other_link](https://other_examplechal1.net/)',
        proposals: 'proposals [link](https://example2chal1.net/)',
        solution: 'solutions [link](https://example3chal1.net/)',
        solutionToDisplay: 'solutionToDisplay [link](https://example4chal1.net/)',
        skillId: 'skill1',
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['fr'],
      });
      const challenge2NoSkill = domainBuilder.buildChallengeForRelease({
        id: 'challenge2',
        instruction: 'instructions',
        proposals: 'proposals [link](https://examplechal2.fr/)',
        skillId: undefined,
        status: ChallengeForRelease.STATUSES.PROPOSE,
        locales: ['fr', 'FR-fr'],
      });
      const pixChallenge3Skill2 = domainBuilder.buildChallengeForRelease({
        id: 'challenge3',
        instruction: 'instructions',
        skillId: 'skill2',
        status: ChallengeForRelease.STATUSES.VALIDE,
        locales: ['en'],
      });
      const wonderlandChallenge4Skill23 = domainBuilder.buildChallengeForRelease({
        id: 'challenge4',
        instruction: 'instructions',
        proposals: 'proposals [link](https://examplechal4.fr/)',
        skillId: 'skill23',
        status: ChallengeForRelease.STATUSES.ARCHIVE,
        locales: ['nl', 'FR-fr'],
      });
      const wonderlandChallenge5Skill23 = domainBuilder.buildChallengeForRelease({
        id: 'challenge5',
        instruction: 'instructions [link](https://examplechal5.net/)',
        skillId: 'skill23',
        status: ChallengeForRelease.STATUSES.PERIME,
        locales: ['nl', 'FR-fr'],
      });
      const latestRelease = domainBuilder.buildDomainRelease.withContent({
        competencesFromRelease: [pixCompetence, wonderlandCompetence],
        tubesFromRelease: [pixTube, wonderlandTube],
        skillsFromRelease: [pixSkill1, pixSkill2, wonderlandSkill1],
        challengesFromRelease: [pixChallenge1Skill1, challenge2NoSkill, pixChallenge3Skill2,
          wonderlandChallenge4Skill23, wonderlandChallenge5Skill23],
      });
      releaseRepository = { getLatestRelease: vi.fn().mockResolvedValue(latestRelease) };
      const localizedChallenges = [
        domainBuilder.buildLocalizedChallenge({ id: 'challenge1', challengeId: 'challenge1', urlsToConsult: ['https://exampleloc1chal1.net', 'https://exampleloc2chal1.net'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'someLocChallenge1', challengeId: 'challenge1', urlsToConsult: ['https://not_me.fr'] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge2', challengeId: 'challenge2', urlsToConsult: [] }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge3', challengeId: 'challenge3', urlsToConsult: null }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge4', challengeId: 'challenge4', urlsToConsult: null }),
        domainBuilder.buildLocalizedChallenge({ id: 'challenge5', challengeId: 'challenge5', urlsToConsult: null }),
      ];
      localizedChallengeRepository = { list: vi.fn().mockResolvedValue(localizedChallenges) };
      urlRepository = {
        exportExternalUrls: vi.fn(),
      };
    });

    it('should export external URLs for operative challenges (and also get urls from primary localized challenge)', async function() {
      // when
      await exportExternalUrlsFromRelease({ releaseRepository, urlRepository, UrlUtils, localizedChallengeRepository });

      // then
      expect(urlRepository.exportExternalUrls).toHaveBeenCalledTimes(1);
      expect(urlRepository.exportExternalUrls).toHaveBeenCalledWith([
        ['Pix','@NomTube1','https://examplechal1.net','fr','validé'],
        ['Pix','@NomTube1','https://other_examplechal1.net','fr','validé'],
        ['Pix','@NomTube1','https://example2chal1.net','fr','validé'],
        ['Pix','@NomTube1','https://example3chal1.net','fr','validé'],
        ['Pix','@NomTube1','https://example4chal1.net','fr','validé'],
        ['Pix','@NomTube1','https://exampleloc1chal1.net','fr','validé'],
        ['Pix','@NomTube1','https://exampleloc2chal1.net','fr','validé'],
        ['wonderland','@NomTube2','https://examplechal4.fr','nl;FR-fr','archivé'],
      ]);
    });
  });
});

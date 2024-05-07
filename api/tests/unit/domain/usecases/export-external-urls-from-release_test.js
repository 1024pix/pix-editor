import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';
import { ChallengeForRelease } from '../../../../lib/domain/models/release/index.js';
import { exportExternalUrlsFromRelease } from '../../../../lib/domain/usecases/index.js';
import { UrlUtils } from '../../../../lib/infrastructure/utils/url-utils.js';

describe('Unit | Domain | Usecases | Export external urls from release', function() {
  describe('#exportExternalUrlsFromRelease', function() {
    let releaseRepository, mockedUrlUtils;
    let consoleLogMock;

    afterEach(() => {
      consoleLogMock.mockReset();
    });

    beforeEach(function() {
      consoleLogMock = vi.spyOn(console, 'log').mockImplementation(() => undefined);
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
      mockedUrlUtils = {
        findUrlsInMarkdown: UrlUtils.findUrlsInMarkdown,
      };
    });

    it('should log external URLs on operative challenges', async function() {
      // when
      await exportExternalUrlsFromRelease({ releaseRepository, UrlUtils: mockedUrlUtils });

      // then
      expect(consoleLogMock.mock.calls[0]).toStrictEqual(['Pix,@NomTube1,https://examplechal1.net,fr,validé']);
      expect(consoleLogMock.mock.calls[1]).toStrictEqual(['Pix,@NomTube1,https://other_examplechal1.net,fr,validé']);
      expect(consoleLogMock.mock.calls[2]).toStrictEqual(['Pix,@NomTube1,https://example2chal1.net,fr,validé']);
      expect(consoleLogMock.mock.calls[3]).toStrictEqual(['wonderland,@NomTube2,https://examplechal4.fr,nl;FR-fr,archivé']);
      expect(consoleLogMock).toHaveBeenCalledTimes(4);
    });
  });
});

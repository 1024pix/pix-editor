import { describe, expect, it, vi } from 'vitest';

import { domainBuilder } from '../../../test-helper.js';
import { search } from '../../../../lib/domain/usecases/search.js';
import { SearchResult } from '../../../../lib/domain/readmodels/index.js';
import { Skill, Challenge } from '../../../../lib/domain/models/index.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | Use Case | search', () => {
  describe('when filter is undefined', () => {
    it('returns an empty array', async () => {
      // given
      const filter = null;

      // when
      const result = await search(filter);

      // then
      expect(result).toStrictEqual([]);
    });
  });

  describe('when query starts with @', () => {
    it('searches skills', async () => {
      // given
      const skillRepository = {
        search: vi.fn().mockResolvedValueOnce([
          domainBuilder.buildSkill({
            id: 'skill1',
            name: '@skill1',
            status: Skill.STATUSES.EN_CONSTRUCTION,
          }),
          domainBuilder.buildSkill({
            id: 'skill2',
            name: '@skill2',
            status: Skill.STATUSES.ACTIF,
          }),
        ]),
      };

      // when
      const result = await search({ name: '@skill' }, { skillRepository });

      // then
      expect(result).toStrictEqual([
        new SearchResult({
          type: 'skill',
          id: 'skill1',
          status: Skill.STATUSES.EN_CONSTRUCTION,
          title: '@skill1',
          locale: null,
        }),
        new SearchResult({
          type: 'skill',
          id: 'skill2',
          status: Skill.STATUSES.ACTIF,
          title: '@skill2',
          locale: null,
        }),
      ]);

      expect(skillRepository.search).toHaveBeenCalledExactlyOnceWith({
        filter: { name: '@skill' },
        sort: [['name', 'asc'], ['version', 'desc']],
        page: { limit: 20 },
      });
    });
  });

  describe('when query looks like a challenge id', () => {
    describe('starting with rec', () => {
      it('loads challenge by id', async () => {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'recId',
          challengeId: 'recId',
          locale: 'fr',
        });
        const localizedChallengeRepository = { get: vi.fn().mockResolvedValueOnce(localizedChallenge) };
        const challengeRepository = {
          get: vi.fn().mockResolvedValueOnce(domainBuilder.buildChallenge({
            id: 'recId',
            status: Challenge.STATUSES.PROPOSE,
            localizedChallenges: [localizedChallenge],
            translations: { fr: { instruction: 'Ya rocket' } },
          })),
        };

        // when
        const result = await search({ name: 'recId' }, { localizedChallengeRepository, challengeRepository });

        // then
        expect(result).toStrictEqual([
          new SearchResult({
            type: 'challenge',
            id: 'recId',
            status: Challenge.STATUSES.PROPOSE,
            title: 'Ya rocket',
            locale: 'fr',
            isPrimary: true,
          }),
        ]);

        expect(localizedChallengeRepository.get).toHaveBeenCalledExactlyOnceWith({ id: 'recId' });
        expect(challengeRepository.get).toHaveBeenCalledExactlyOnceWith('recId');
      });
    });

    describe('starting with challenge', () => {
      it('loads challenge by id', async () => {
        // given
        const localizedChallenge = domainBuilder.buildLocalizedChallenge({
          id: 'challengeId',
          challengeId: 'challengeId',
          locale: 'fr',
        });
        const localizedChallengeRepository = { get: vi.fn().mockResolvedValueOnce(localizedChallenge) };
        const challengeRepository = {
          get: vi.fn().mockResolvedValueOnce(domainBuilder.buildChallenge({
            id: 'challengeId',
            status: Challenge.STATUSES.PROPOSE,
            localizedChallenges: [localizedChallenge],
            translations: { fr: { instruction: 'Ya rocket' } },
          })),
        };

        // when
        const result = await search({ name: 'challengeId' }, { localizedChallengeRepository, challengeRepository });

        // then
        expect(result).toStrictEqual([
          new SearchResult({
            type: 'challenge',
            id: 'challengeId',
            status: Challenge.STATUSES.PROPOSE,
            title: 'Ya rocket',
            locale: 'fr',
            isPrimary: true,
          }),
        ]);

        expect(localizedChallengeRepository.get).toHaveBeenCalledExactlyOnceWith({ id: 'challengeId' });
        expect(challengeRepository.get).toHaveBeenCalledExactlyOnceWith('challengeId');
      });
    });

    describe('unknown in database', () => {
      it('returns an empty array', async () => {
        // given
        const localizedChallengeRepository = { get: vi.fn().mockRejectedValueOnce(new NotFoundError('Épreuve introuvable')) };

        // when
        const result = await search({ name: 'recId1' }, { localizedChallengeRepository });

        // then
        expect(result).toStrictEqual([]);
        expect(localizedChallengeRepository.get).toHaveBeenCalledExactlyOnceWith({ id: 'recId1' });
      });
    });
  });

  describe('when query is some other text', () => {
    it('searches by translated fields', async () => {
      // given
      const localizedChallenge1 = domainBuilder.buildLocalizedChallenge({
        id: 'localizedChallenge1',
        challengeId: 'challenge1',
        locale: 'nl',
      });
      const localizedChallenge2 = domainBuilder.buildLocalizedChallenge({
        id: 'challenge2',
        challengeId: 'challenge2',
        locale: 'fr',
      });

      const localizedChallengeRepository = { filter: vi.fn().mockResolvedValueOnce([localizedChallenge1, localizedChallenge2]) };
      const challengeRepository = {
        getMany: vi.fn().mockResolvedValueOnce([
          domainBuilder.buildChallenge({
            id: 'challenge1',
            status: Challenge.STATUSES.PROPOSE,
            localizedChallenges: [
              domainBuilder.buildLocalizedChallenge({
                id: 'challenge1',
                challengeId: 'challenge1',
                locale: 'fr',
              }),
              localizedChallenge1,
            ],
            translations: { nl: { instruction: 'Yä rocket' } },
          }),
          domainBuilder.buildChallenge({
            id: 'challenge2',
            status: Challenge.STATUSES.VALIDE,
            localizedChallenges: [localizedChallenge2],
            translations: { fr: { instruction: 'Ya rocket' } },
          }),
        ]),
      };

      // when
      const result = await search({ name: 'rocket' }, { localizedChallengeRepository, challengeRepository });

      // then
      expect(result).toStrictEqual([
        new SearchResult({
          type: 'challenge',
          id: 'localizedChallenge1',
          status: Challenge.STATUSES.PROPOSE,
          title: 'Yä rocket',
          locale: 'nl',
          isPrimary: false,
        }),
        new SearchResult({
          type: 'challenge',
          id: 'challenge2',
          status: Challenge.STATUSES.VALIDE,
          title: 'Ya rocket',
          locale: 'fr',
          isPrimary: true,
        }),
      ]);

      expect(localizedChallengeRepository.filter).toHaveBeenCalledExactlyOnceWith({ filter: { search: 'rocket' }, page: { limit: 20 } });
      expect(challengeRepository.getMany).toHaveBeenCalledExactlyOnceWith(['challenge1', 'challenge2']);
    });
  });
});

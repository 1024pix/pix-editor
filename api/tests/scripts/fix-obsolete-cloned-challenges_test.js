import { afterEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder, knex } from '../test-helper.js';
import { challengeRepository, releaseRepository } from '../../lib/infrastructure/repositories/index.js';
import { ChallengeForRelease } from '../../lib/domain/models/release/index.js';
import * as script from '../../scripts/fix-obsolete-cloned-challenges/index.js';
import { Challenge } from '../../lib/domain/models/index.js';

describe('Script | Fix obsolete cloned challenges', function() {
  afterEach(async () => {
    await knex('focus_phrase').truncate();
  });

  it('should revert obsolete challenges with no attachments within a specific script execution to their original statuses', async function() {
    // given
    const scriptToExect = '123456789';
    await knex('focus_phrase').insert([
      {
        id: 1,
        createdAt: new Date(),
        originPersistantId: 'null',
        persistantId: 'challengeNotInScript',
        type: 'challenge',
        scriptExectId: '789456123',
      },
      {
        id: 2,
        createdAt: new Date(),
        originPersistantId: 'null',
        persistantId: 'skillIgnored',
        type: 'skill',
        scriptExectId: scriptToExect,
      },
      {
        id: 3,
        createdAt: new Date(),
        originPersistantId: 'null',
        persistantId: 'challengeWithAttachmentIllustration',
        type: 'challenge',
        scriptExectId: scriptToExect,
      },
      {
        id: 4,
        createdAt: new Date(),
        originPersistantId: 'null',
        persistantId: 'challengeWithAttachmentAtt',
        type: 'challenge',
        scriptExectId: scriptToExect,
      },
      {
        id: 5,
        createdAt: new Date(),
        originPersistantId: 'null',
        persistantId: 'challengeA',
        type: 'challenge',
        scriptExectId: scriptToExect,
      },
      {
        id: 6,
        createdAt: new Date(),
        originPersistantId: 'null',
        persistantId: 'challengeB',
        type: 'challenge',
        scriptExectId: scriptToExect,
      },
      {
        id: 7,
        createdAt: new Date(),
        originPersistantId: 'null',
        persistantId: 'challengeC',
        type: 'challenge',
        scriptExectId: scriptToExect,
      },
    ]);
    const challengeAFromRelease = domainBuilder.buildChallengeForRelease({
      id: 'challengeA',
      status: ChallengeForRelease.STATUSES.VALIDE,
      illustrationUrl: null,
    });
    challengeAFromRelease.attachments = undefined;
    const challengeBFromRelease = domainBuilder.buildChallengeForRelease({
      id: 'challengeB',
      status: ChallengeForRelease.STATUSES.PROPOSE,
      illustrationUrl: null,
      attachments: [],
    });
    const challengeWithIllustration = domainBuilder.buildChallengeForRelease({
      id: 'challengeWithAttachmentIllustration',
      status: ChallengeForRelease.STATUSES.VALIDE,
      illustrationUrl: 'some attachment url',
      attachments: [],
    });
    const challengeWithPieceJointe = domainBuilder.buildChallengeForRelease({
      id: 'challengeWithAttachmentAtt',
      status: ChallengeForRelease.STATUSES.PROPOSE,
      illustrationUrl: null,
      attachments: ['piece jointe'],
    });
    const release = domainBuilder.buildDomainRelease({
      content: domainBuilder.buildContentForRelease({
        challenges: [
          challengeAFromRelease,
          challengeBFromRelease,
          challengeWithIllustration,
          challengeWithPieceJointe,
        ],
      }),
    });

    const challengeAOnAirtable = domainBuilder.buildChallenge({
      id: 'challengeA',
      status: Challenge.STATUSES.PERIME,
      madeObsoleteAt: '2023-04-04T10:47:05.555Z',
      files: [],
    });
    const challengeBOnAirtable = domainBuilder.buildChallenge({
      id: 'challengeB',
      status: Challenge.STATUSES.PERIME,
      madeObsoleteAt: '2023-04-04T10:57:05.555Z',
      files: [],
    });
    const challengeCOnAirtable = domainBuilder.buildChallenge({
      id: 'challengeC',
      status: Challenge.STATUSES.PERIME,
      madeObsoleteAt: '2023-04-04T10:37:05.555Z',
      files: [],
    });
    const challengesFromAirtable = [challengeAOnAirtable, challengeBOnAirtable, challengeCOnAirtable];
    vi.spyOn(releaseRepository, 'getRelease').mockResolvedValue(release);
    vi.spyOn(challengeRepository, 'get')
      .mockImplementation((id) => challengesFromAirtable.find((chal) => chal.id === id));
    vi.spyOn(challengeRepository, 'update')
      .mockResolvedValue(true);

    // when
    await script.revertObsoleteChallengesToOriginalStatus({
      dryRun: false,
      scriptExectIdToFix: scriptToExect,
      releaseId: 'someReleaseId',
    });

    // then
    expect(releaseRepository.getRelease).toHaveBeenCalledWith('someReleaseId');
    expect(challengeRepository.update).toHaveBeenCalledTimes(2);
    expect(challengeRepository.update).toHaveBeenCalledWith(domainBuilder.buildChallenge({
      ...challengeAOnAirtable,
      status: Challenge.STATUSES.VALIDE,
      madeObsoleteAt: null,
    }));
    expect(challengeRepository.update).toHaveBeenCalledWith(domainBuilder.buildChallenge({
      ...challengeBOnAirtable,
      status: Challenge.STATUSES.PROPOSE,
      madeObsoleteAt: null,
    }));
  });
});

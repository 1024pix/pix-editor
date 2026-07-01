import { describe, it, vi, expect } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { switchGenealogy } from '../../../../lib/domain/usecases/switch-genealogy.js';
import { Challenge } from '../../../../lib/domain/models/Challenge.js';
import { DomainTransaction } from '../../../../lib/domain/DomainTransaction.js';
import { updateByLocalizedChallengeId } from '../../../../lib/infrastructure/repositories/localized-challenge-repository.js';

describe('Unit | Domain | Usecases | switch genealogy', function() {
  it('should switch genealogy and alternativeVersion between alternative and its prototype', async () => {
    // given
    const prototypeToUpdate = domainBuilder.buildChallenge({
      id: 'protoId',
      version: 1,
      alternativeVersion: null,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      accessibility1: Challenge.ACCESSIBILITY1.RAS,
      accessibility2: Challenge.ACCESSIBILITY2.KO,
    });
    const alternativeToUpdate = domainBuilder.buildChallenge({
      id: 'alterId',
      version: 1,
      alternativeVersion: 5,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
    });
    const challengeRepositoryStub = {
      get: vi.fn().mockResolvedValueOnce(alternativeToUpdate),
      getPrototypeBySkillId: vi.fn().mockResolvedValueOnce(prototypeToUpdate),
      updateByChallengeId: vi.fn(),
    };
    const localizedChallengeRepositoryStub = { updateByLocalizedChallengeId: vi.fn() };

    const domainTransactionStub = vi.spyOn(DomainTransaction, 'execute');

    // when
    await switchGenealogy({ alternativeChallengeId: alternativeToUpdate.id, dependencies: { challengeRepository: challengeRepositoryStub, localizedChallengeRepository: localizedChallengeRepositoryStub } });

    // then
    expect(challengeRepositoryStub.get).toHaveBeenCalledExactlyOnceWith(alternativeToUpdate.id);
    expect(challengeRepositoryStub.getPrototypeBySkillId).toHaveBeenCalledExactlyOnceWith(alternativeToUpdate.skillId, alternativeToUpdate.version);
    expect(challengeRepositoryStub.updateByChallengeId).toHaveBeenCalledTimes(2);
    expect(challengeRepositoryStub.updateByChallengeId).toHaveBeenCalledWith({
      id: alternativeToUpdate.id,
      alternativeVersion: null,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
      accessibility1: prototypeToUpdate.accessibility1,
      accessibility2: prototypeToUpdate.accessibility2,
    });
    expect(challengeRepositoryStub.updateByChallengeId).toHaveBeenCalledWith({
      id: prototypeToUpdate.id,
      alternativeVersion: 5,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
    });
    expect(localizedChallengeRepositoryStub.updateByLocalizedChallengeId).toHaveBeenCalledTimes(1);
    expect(domainTransactionStub).toHaveBeenCalledOnce();
  });
});

import { describe, it, vi, expect } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { switchGenealogy } from '../../../../lib/domain/usecases/switch-genealogy.js';
import { Challenge } from '../../../../lib/domain/models/Challenge.js';
import { DomainTransaction } from '../../../../lib/domain/DomainTransaction.js';

describe('Unit | Domain | Usecases | switch genealogy', function() {
  it('should switch genealogy and alternativeVersion between alternative and its prototype', async () => {
    // given

    const prototypeToUpdate = domainBuilder.buildChallenge({ id: 'protoId', version: 1, alternativeVersion: null, genealogy: Challenge.GENEALOGIES.PROTOTYPE });
    const alternativeToUpdate = domainBuilder.buildChallenge({ id: 'alterId', version: 1, alternativeVersion: 5, genealogy: Challenge.GENEALOGIES.DECLINAISON });
    const challengeRepositoryStub = {
      get: vi.fn().mockResolvedValueOnce(alternativeToUpdate), // on récupère la décli
      getPrototypeByAlternativeId: vi.fn().mockResolvedValueOnce(prototypeToUpdate), // on récupère son proto
      updateByChallengeId: vi.fn(), // on met à jour les 2 challenges (par un usecase appelé)
    };

    const domainTransactionStub = vi.spyOn(DomainTransaction, 'execute');

    // when
    await switchGenealogy({ alternativeChallengeId: alternativeToUpdate.id, dependencies: {challengeRepository: challengeRepositoryStub} });

    // then
    expect(challengeRepositoryStub.get).toHaveBeenCalledExactlyOnceWith(alternativeToUpdate.id);
    expect(challengeRepositoryStub.getPrototypeByAlternativeId).toHaveBeenCalledExactlyOnceWith(alternativeToUpdate.id);
    expect(challengeRepositoryStub.updateByChallengeId).toHaveBeenCalledTimes(2);
    expect(challengeRepositoryStub.updateByChallengeId).toHaveBeenCalledWith({
      id: alternativeToUpdate.id,
      alternativeVersion: null,
      genealogy: Challenge.GENEALOGIES.PROTOTYPE,
    });
    expect(challengeRepositoryStub.updateByChallengeId).toHaveBeenCalledWith({
      id: prototypeToUpdate.id,
      alternativeVersion: 5,
      genealogy: Challenge.GENEALOGIES.DECLINAISON,
    });
    expect(domainTransactionStub).toHaveBeenCalledOnce();
  });
});

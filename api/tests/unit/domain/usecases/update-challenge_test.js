import { describe, it, vi, expect, beforeEach } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { updateChallenge } from '../../../../lib/domain/usecases/update-challenge.js';
import { challengeRepository } from '../../../../lib/infrastructure/repositories/index.js';
import * as updatedRecordNotifier from '../../../../lib/infrastructure/event-notifier/updated-record-notifier.js';
import * as pixApiClient from '../../../../lib/infrastructure/pix-api-client.js';
import { attachmentDatasource } from '../../../../lib/infrastructure/datasources/airtable/index.js';
import _ from 'lodash';

describe('Unit | Domain | Usecases | update challenge', function() {
  beforeEach(() => {
    vi.spyOn(challengeRepository, 'update');
    vi.spyOn(updatedRecordNotifier, 'notify');
    vi.spyOn(attachmentDatasource, 'filterByLocalizedChallengeId');
  });

  describe('when challenge id is unknown', () => {
    it('should throw a airtableError', async() => {
      // given
      const challengeUpdates = domainBuilder.buildChallenge({
        locales: ['en']
      });

      challengeRepository.update.mockRejectedValueOnce(new Error('Épreuve introuvable'));

      // when
      const result = updateChallenge(challengeUpdates, { challengeRepository });

      // then
      await expect(result).rejects.toBeInstanceOf(Error);
      await expect(result).rejects.toHaveProperty('message', 'Épreuve introuvable');

      expect(challengeRepository.update).toHaveBeenCalledWith(challengeUpdates);
    });
  });

  it('should update challenge', async () =>{
    // given
    const challengeUpdates = domainBuilder.buildChallenge({
      id: 'updatedChallengeId',
      locales: ['en'],
      updatedAt: '2021-10-04'
    });

    const updatedChallenge = domainBuilder.buildChallenge({
      id: 'updatedChallengeId',
      locales: ['en'],
      updatedAt: '2025-10-04'
    });

    attachmentDatasource.filterByLocalizedChallengeId.mockResolvedValueOnce([]);
    challengeRepository.update.mockResolvedValueOnce(updatedChallenge);
    updatedRecordNotifier.notify.mockResolvedValueOnce();

    const fieldToOmitForChallengeRelease = [
      'airtableId',
      'archivedAt',
      'author',
      'contextualizedFields',
      'createdAt',
      'declinable',
      'files',
      'geography',
      'localizedChallenges',
      'madeObsoleteAt',
      'pedagogy',
      'skills',
      'spoil',
      'updatedAt',
      'urlsToConsult',
      'validatedAt',
      'version'
    ];
    const expectedChallengeFOrRelease = _.omit(challengeUpdates, fieldToOmitForChallengeRelease);

    // when
    const result = await updateChallenge(challengeUpdates, { challengeRepository, attachmentDatasource });

    // then
    expect(result).toBe(updatedChallenge);
    expect(challengeRepository.update).toHaveBeenCalledWith(challengeUpdates);
    expect(attachmentDatasource.filterByLocalizedChallengeId).toHaveBeenCalledWith('updatedChallengeId');
    expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
      model: 'challenges',
      pixApiClient,
      updatedRecord: {
        ...expectedChallengeFOrRelease,
        'illustrationUrl': null,
      },
    });
  });

  it.each([
    ['fr', { instruction: 'Ça va ?', proposals:'Oui !', alternativeInstruction: 'Et donc ; voilà' }],
    ['fr-fr', { instruction: 'Ça va ?', proposals:'Oui !', alternativeInstruction: 'Et donc ; voilà' }],
    ['other', { instruction: 'Ça va ?', proposals:'Oui !', alternativeInstruction: 'Et donc ; voilà' }],
  ])('should normalize breaking space when challenge is `fr` or `fr-fr`', async (locale, { instruction, proposals, alternativeInstruction }) => {
    const challenge = domainBuilder.buildChallenge({
      id: 'challengeId',
      locales: [locale],
      localizedChallenges: [
        domainBuilder.buildLocalizedChallenge({
          id: 'challengeId',
          challengeId: 'challengeId',
          locale,
          instruction: 'Ça va ?',
          proposals: 'Oui !',
          alternativeInstruction: 'Et donc ; voilà'
        })
      ],
    });

    attachmentDatasource.filterByLocalizedChallengeId.mockResolvedValueOnce([]);
    challengeRepository.update.mockResolvedValueOnce(challenge);
    updatedRecordNotifier.notify.mockResolvedValueOnce();

    await updateChallenge(challenge, { challengeRepository, attachmentDatasource });

    expect(challengeRepository.update).toHaveBeenCalledOnce();
    expect(challengeRepository.update).toHaveBeenCalledWith({
      ...challenge,
      instruction,
      proposals,
      alternativeInstruction
    });
  });

  describe('when record notifier fails', () => {
    it('should resolve anyway', async () =>{
      // given
      const challengeUpdates = domainBuilder.buildChallenge({
        id: 'updatedChallengeId',
        locales: ['en'],
        updatedAt: '2021-10-04'
      });

      const updatedChallenge = domainBuilder.buildChallenge({
        id: 'updatedChallengeId',
        locales: ['en'],
        updatedAt: '2025-10-04'
      });

      const fieldToOmitForChallengeRelease = [
        'airtableId',
        'archivedAt',
        'author',
        'contextualizedFields',
        'createdAt',
        'declinable',
        'files',
        'geography',
        'localizedChallenges',
        'madeObsoleteAt',
        'pedagogy',
        'skills',
        'spoil',
        'updatedAt',
        'urlsToConsult',
        'validatedAt',
        'version'
      ];
      const expectedChallengeFOrRelease = _.omit(challengeUpdates, fieldToOmitForChallengeRelease);

      attachmentDatasource.filterByLocalizedChallengeId.mockResolvedValueOnce([]);
      challengeRepository.update.mockResolvedValueOnce(updatedChallenge);
      updatedRecordNotifier.notify.mockRejectedValueOnce(new Error());

      // when
      const result = await updateChallenge(challengeUpdates, { challengeRepository, attachmentDatasource });

      // then
      expect(result).toBe(updatedChallenge);
      expect(challengeRepository.update).toHaveBeenCalledWith(challengeUpdates);
      expect(attachmentDatasource.filterByLocalizedChallengeId).toHaveBeenCalledWith('updatedChallengeId');
      expect(updatedRecordNotifier.notify).toHaveBeenCalledWith({
        model: 'challenges',
        pixApiClient,
        updatedRecord: {
          ...expectedChallengeFOrRelease,
          'illustrationUrl': null,
        },
      });
    });
  });
});

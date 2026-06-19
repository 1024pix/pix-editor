import { beforeEach, describe, expect, it, vi } from 'vitest';
import { domainBuilder } from '../../../test-helper.js';

import { importTranslations } from '../../../../lib/domain/usecases/index.js';
import { LocalizedChallenge } from '../../../../lib/domain/models/index.js';

describe('Unit | Domain | Use Cases | import-translations', () => {
  let localizedChallengeRepository, translationRepository;

  beforeEach(() => {
    localizedChallengeRepository = { create: vi.fn() };
    translationRepository = { save: vi.fn() };
  });

  describe('when given translations array is empty', () => {
    it('does nothing', async () => {
      // given
      const translations = [];

      // when
      await importTranslations(translations, { localizedChallengeRepository, translationRepository });

      // then
      expect(localizedChallengeRepository.create).not.toHaveBeenCalled();
      expect(translationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('when there is no challenge translations', () => {
    it('save only translations to DB', async () => {
      // given
      const translations = [domainBuilder.buildTranslation({ key: 'area.area123.title', locale: 'nl', value: 'area123 title nl' }), domainBuilder.buildTranslation({ key: 'competence.competence456.name', locale: 'es', value: 'competence456 name es' })];

      // when
      await importTranslations(translations, { localizedChallengeRepository, translationRepository });

      // then
      expect(localizedChallengeRepository.create).not.toHaveBeenCalled();
      expect(translationRepository.save).toHaveBeenCalledExactlyOnceWith({ translations });
    });
  });

  describe('when there are challenge translations', () => {
    it('save translations and localizedChallenges to DB', async () => {
      // given
      const translations = [
        domainBuilder.buildTranslation({ key: 'area.area123.title', locale: 'nl', value: 'area123 title nl' }),
        domainBuilder.buildTranslation({ key: 'competence.competence456.name', locale: 'es', value: 'competence456 name es' }),
        domainBuilder.buildTranslation({ key: 'challenge.challenge789.instruction', locale: 'nl', value: 'challenge789 instruction nl' }),
        domainBuilder.buildTranslation({ key: 'challenge.challenge789.solution', locale: 'nl', value: 'challenge789 solution nl' }),
        domainBuilder.buildTranslation({ key: 'challenge.challenge789.instruction', locale: 'es', value: 'challenge789 instruction es' }),
        domainBuilder.buildTranslation({ key: 'challenge.challenge789.solution', locale: 'es', value: 'challenge789 solution es' }),
        domainBuilder.buildTranslation({ key: 'challenge.challenge321.instruction', locale: 'nl', value: 'challenge321 instruction nl' }),
        domainBuilder.buildTranslation({ key: 'challenge.challenge321.solution', locale: 'nl', value: 'challenge321 solution nl' }),
      ];

      // when
      await importTranslations(translations, { localizedChallengeRepository, translationRepository });

      // then
      expect(localizedChallengeRepository.create).toHaveBeenCalledExactlyOnceWith({
        localizedChallenges: [
          domainBuilder.buildLocalizedChallenge({ challengeId: 'challenge789', locale: 'nl', id: null, embedUrl: null, status: LocalizedChallenge.STATUSES.PAUSE, urlsToConsult: null }),
          domainBuilder.buildLocalizedChallenge({ challengeId: 'challenge789', locale: 'es', id: null, embedUrl: null, status: LocalizedChallenge.STATUSES.PAUSE, urlsToConsult: null }),
          domainBuilder.buildLocalizedChallenge({ challengeId: 'challenge321', locale: 'nl', id: null, embedUrl: null, status: LocalizedChallenge.STATUSES.PAUSE, urlsToConsult: null }),
        ],
      });
      expect(translationRepository.save).toHaveBeenCalledExactlyOnceWith({ translations });
    });
  });
});

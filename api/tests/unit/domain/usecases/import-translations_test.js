import { describe, expect, it, vi } from 'vitest';
import { Translation } from '../../../../lib/domain/models/index.js';
import {
  importTranslations
} from '../../../../lib/domain/usecases/import-translations';

describe('Unit | Domain | Usecases | import-translations', function() {
  it('should write in database translation from CSV', async () => {
    // given
    const csv = 'key,locale,value\nsome.key,fr-FR,coucou';
    const translationRepository = {
      save: vi.fn(),
    };

    // when
    await importTranslations(csv, { translationRepository });

    // then
    expect(translationRepository.save).toHaveBeenCalledOnce();
    expect(translationRepository.save).toHaveBeenCalledWith([new Translation({
      key: 'some.key',
      locale: 'fr-FR',
      value: 'coucou'
    })]);
  });
});

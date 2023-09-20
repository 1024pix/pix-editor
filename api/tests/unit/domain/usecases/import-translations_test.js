import { describe, expect, it, vi } from 'vitest';
import { Translation } from '../../../../lib/domain/models/index.js';
import {
  importTranslations
} from '../../../../lib/domain/usecases/import-translations';
import { PassThrough } from 'node:stream';

describe('Unit | Domain | Usecases | import-translations', function() {
  it('should write in database translation from CSV', async () => {
    // given
    const csvStream = new PassThrough();
    const translationRepository = {
      save: vi.fn(),
    };

    // when
    const promise = importTranslations(csvStream, { translationRepository });
    csvStream.write('key,locale,value\nsome.key,fr-FR,coucou');
    csvStream.end();

    // then
    await promise;

    expect(translationRepository.save).toHaveBeenCalledOnce();
    expect(translationRepository.save).toHaveBeenCalledWith([new Translation({
      key: 'some.key',
      locale: 'fr-FR',
      value: 'coucou'
    })]);
  });

  it('should return an error when the CSV doesnt contain valid translations', async () => {
    // given
    const csvStream = new PassThrough();
    const translationRepository = {
      save: vi.fn(),
    };

    // when
    const promise = importTranslations(csvStream, { translationRepository });
    csvStream.write('one invalid header,locale\navalue,anotherone');
    csvStream.end();

    // then
    await expect(promise).rejects.toThrow();
    expect(translationRepository.save).not.toHaveBeenCalled();
  });

  it('should return an error when its the CSV doesnt contain valid translations', async () => {
    // given
    const csvStream = new PassThrough();
    const translationRepository = {
      save: vi.fn(),
    };

    // when
    const promise = importTranslations(csvStream, { translationRepository });
    csvStream.write('some data');
    csvStream.end();

    // then
    await expect(promise).rejects.toThrow();
    expect(translationRepository.save).not.toHaveBeenCalled();
  });
});

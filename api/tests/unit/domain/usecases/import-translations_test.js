import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Translation, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import {
  importTranslations
} from '../../../../lib/domain/usecases/import-translations';
import { PassThrough } from 'node:stream';

describe('Unit | Domain | Usecases | import-translations', function() {
  let csvStream;
  let localizedChallengeRepository;
  let translationRepository;

  beforeEach(() => {
    csvStream = new PassThrough();
    localizedChallengeRepository = {
      create: vi.fn()
    };
    translationRepository = {
      save: vi.fn(),
    };
  });

  it('should write in database translation from CSV', async () => {
    // when
    const promise = importTranslations(csvStream, { localizedChallengeRepository, translationRepository });
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
    // when
    const promise = importTranslations(csvStream, { localizedChallengeRepository, translationRepository });
    csvStream.write('one invalid header,locale\navalue,anotherone');
    csvStream.end();

    // then
    await expect(promise).rejects.toThrow();
    expect(translationRepository.save).not.toHaveBeenCalled();
  });

  it('should return an error when its the CSV doesnt contain valid translations', async () => {
    // when
    const promise = importTranslations(csvStream, { localizedChallengeRepository, translationRepository });
    csvStream.write('some data');
    csvStream.end();

    // then
    await expect(promise).rejects.toThrow();
    expect(translationRepository.save).not.toHaveBeenCalled();
  });

  it('should create a localized challenge when a new locale is added', async () => {
    // when
    const promise = importTranslations(csvStream, { localizedChallengeRepository, translationRepository });
    csvStream.write('key,locale,value\nchallenge.id.key,fr-FR,coucou\nchallenge.id.key2,fr-FR,coucou2');
    csvStream.end();

    // then
    await promise;

    expect(translationRepository.save).toHaveBeenCalledOnce();
    expect(translationRepository.save).toHaveBeenCalledWith([
      new Translation({
        key: 'challenge.id.key',
        locale: 'fr-FR',
        value: 'coucou'
      }),
      new Translation({
        key: 'challenge.id.key2',
        locale: 'fr-FR',
        value: 'coucou2'
      })
    ]);
    expect(localizedChallengeRepository.create).toHaveBeenCalledOnce();
    expect(localizedChallengeRepository.create).toHaveBeenCalledWith([new LocalizedChallenge({
      challengeId: 'id',
      locale: 'fr-FR',
    })]);
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { Translation, LocalizedChallenge } from '../../../../lib/domain/models/index.js';
import {
  InvalidFileError,
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
    csvStream.write('key_name,nl,comment\nsome.key,Hallo,');
    csvStream.end();

    // then
    await promise;

    expect(translationRepository.save).toHaveBeenCalledOnce();
    expect(translationRepository.save).toHaveBeenCalledWith([new Translation({
      key: 'some.key',
      locale: 'nl',
      value: 'Hallo'
    })]);
  });

  it('should return an error when the CSV doesn\'t have key_name as first column', async () => {
    // when
    const promise = importTranslations(csvStream, { localizedChallengeRepository, translationRepository });
    csvStream.write('one invalid header,nl,comment\navalue,anotherone,');
    csvStream.end();

    // then
    await expect(promise).rejects.toThrow(new InvalidFileError('Expected first column to be key_name'));
    expect(translationRepository.save).not.toHaveBeenCalled();
  });

  it('should return an error when the CSV doesn\'t have a valid locale as second column', async () => {
    // when
    const promise = importTranslations(csvStream, { localizedChallengeRepository, translationRepository });
    csvStream.write('key_name,invalid_locale,comment\navalue,anotherone,');
    csvStream.end();

    // then
    await expect(promise).rejects.toThrow(new InvalidFileError('Expected second column to be a valid locale'));
    expect(translationRepository.save).not.toHaveBeenCalled();
  });

  it('should create a localized challenge when a new locale is added', async () => {
    // when
    const promise = importTranslations(csvStream, { localizedChallengeRepository, translationRepository });
    csvStream.write('key_name,nl,comment\nchallenge.id.key,Hallo,\nchallenge.id.key2,Hallo2,');
    csvStream.end();

    // then
    await promise;

    expect(translationRepository.save).toHaveBeenCalledOnce();
    expect(translationRepository.save).toHaveBeenCalledWith([
      new Translation({
        key: 'challenge.id.key',
        locale: 'nl',
        value: 'Hallo'
      }),
      new Translation({
        key: 'challenge.id.key2',
        locale: 'nl',
        value: 'Hallo2'
      })
    ]);
    expect(localizedChallengeRepository.create).toHaveBeenCalledOnce();
    expect(localizedChallengeRepository.create).toHaveBeenCalledWith([new LocalizedChallenge({
      challengeId: 'id',
      locale: 'nl',
    })]);
  });
});

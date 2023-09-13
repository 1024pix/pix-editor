import { describe, expect, it } from 'vitest';
import { PassThrough } from 'node:stream';
import { streamToPromise } from '../../../test-helper';
import { Translation } from '../../../../lib/domain/models/Translation';
import {
  exportTranslations
} from '../../../../lib/domain/usecases/export-translations';

describe('Unit | Domain | Usecases | export-translations', function() {
  it('write the translations as a csv to a stream', async function() {
    const translationRepository = {
      list() {
        return [
          new Translation({
            key: 'some.key',
            locale: 'fr',
            value: 'Bonjour'
          }),
          new Translation({
            key: 'some.key',
            locale: 'en',
            value: 'Hello,'
          }),
        ];
      }
    };
    const stream = new PassThrough();
    const promise = streamToPromise(stream);
    await exportTranslations(stream, { translationRepository });
    const result =  await promise;
    expect(result).to.equal('key,locale,value\nsome.key,fr,Bonjour\nsome.key,en,"Hello,"');
  });
});

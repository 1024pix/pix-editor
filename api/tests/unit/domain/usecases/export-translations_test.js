import { describe, expect, it } from 'vitest';
import { PassThrough } from 'node:stream';
import { streamToPromise } from '../../../test-helper';
import { Translation } from '../../../../lib/domain/models/Translation';
import {
  exportTranslations
} from '../../../../lib/domain/usecases/export-translations';

describe('Unit | Domain | Usecases | export-translations', function() {
  it('write the translations as a csv to a stream', async function() {
    const streamListStream = new PassThrough({
      readableObjectMode: true,
      writableObjectMode: true,
    });
    function writeTranslationStream() {
      streamListStream.write(new Translation({
        key: 'some.key',
        locale: 'fr',
        value: 'Bonjour'
      }));
      streamListStream.end();
    }
    const translationRepository = {
      streamList() {
        return streamListStream;
      }
    };
    const stream = new PassThrough();
    const promise = streamToPromise(stream);

    exportTranslations(stream, { translationRepository });
    writeTranslationStream();

    const result = await promise;
    expect(result).to.equal('key,fr\nsome.key,Bonjour');
  });
});

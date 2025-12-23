import { PassThrough } from 'node:stream';
import { beforeEach, describe, expect, it } from 'vitest';

import { Translation } from '../../../../lib/domain/models/index.js';
import { parseTranslationsCsvStream, InvalidFileError } from '../../../../lib/domain/services/parse-translations-csv-stream.js';

describe('Unit | Domain | Services | parse-translations-csv-stream', function() {
  let csvStream;

  beforeEach(() => {
    csvStream = new PassThrough();
  });

  it('should parse translations from CSV', async () => {
    // given
    csvStream.write('key_name,nl,comment\nchallenge.id.key,Hallo,\nchallenge.id.key2,Hallo2,\nchallenge.id2.key,Hallo3,\narea.area1.title,Harea,');
    csvStream.end();

    // when
    const translations = await parseTranslationsCsvStream(csvStream);

    // then
    expect(translations).toStrictEqual([
      new Translation({
        key: 'challenge.id.key',
        locale: 'nl',
        value: 'Hallo',
      }),
      new Translation({
        key: 'challenge.id.key2',
        locale: 'nl',
        value: 'Hallo2',
      }),
      new Translation({
        key: 'challenge.id2.key',
        locale: 'nl',
        value: 'Hallo3',
      }),
      new Translation({
        key: 'area.area1.title',
        locale: 'nl',
        value: 'Harea',
      }),
    ]);
  });

  it("should return an error when the CSV doesn't have key_name as first column", async () => {
    // given
    csvStream.write('one invalid header,nl,comment\navalue,anotherone,');
    csvStream.end();

    // when
    const result = parseTranslationsCsvStream(csvStream);

    // then
    await expect(result).rejects.toThrow(new InvalidFileError('Expected first column to be key_name'));
  });

  it("should return an error when the CSV doesn't have a valid locale as second column", async () => {
    // given
    csvStream.write('key_name,invalid_locale,comment\navalue,anotherone,');
    csvStream.end();

    // when
    const result = parseTranslationsCsvStream(csvStream);

    // then
    await expect(result).rejects.toThrow(new InvalidFileError('Expected second column to be a valid locale'));
  });
});

import { parseStream } from 'fast-csv';

import { Translation } from '../models/index.js';

export class InvalidFileError extends Error {}

export async function parseTranslationsCsvStream(csvStream) {
  return new Promise((resolve, reject) => {
    const translations = [];
    let locale;
    parseStream(csvStream, {
      headers: (headers) => {
        if (headers[0] !== 'key_name') throw new InvalidFileError('Expected first column to be key_name');
        locale = headers[1];
        try {
          new Intl.Locale(locale);
        } catch {
          throw new InvalidFileError('Expected second column to be a valid locale');
        }
        return [
          'key',
          'value',
          ...Array(headers.length - 2),
        ];
      },
      objectMode: true,
      strictColumnHandling: true,
    })
      .validate((data) => data.key && data.value)
      .on('error', reject)
      .on('data-invalid', (invalidData) => {
        reject(new InvalidFileError(`Invalid data: ${JSON.stringify(invalidData)}`));
      })
      .on('data', (row) => {
        translations.push(new Translation({ ...row, locale }));
      })
      .on('end', () => {
        resolve(translations);
      });
  });
}

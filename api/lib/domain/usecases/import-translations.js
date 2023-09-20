import { translationRepository } from '../../infrastructure/repositories/index.js';
import { Translation } from '../models/index.js';
import { parseStream } from 'fast-csv';

export class InvalidFileError extends Error {}

export function importTranslations(csvStream, dependencies = { translationRepository }) {
  return new Promise((resolve, reject) => {
    const translations = [];
    parseStream(csvStream, {
      headers: true,
      strictColumnHandling: true,
    }).validate((data) => data.key && data.locale && data.value)
      .on('error', reject)
      .on('data-invalid', reject)
      .on('data', (row) => {
        translations.push(new Translation(row));
      })
      .on('end', async () => {
        if (translations.length === 0) {
          return reject(new InvalidFileError());
        }
        await dependencies.translationRepository.save(translations);
        resolve();
      });
  });
}

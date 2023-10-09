import csv from 'fast-csv';
import { translationRepository } from '../../infrastructure/repositories/index.js';

export async function exportTranslations(stream, dependencies = { translationRepository }) {
  const translationsStream = dependencies.translationRepository.streamList({ locale: 'fr' });
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(stream);
  translationsStream
    .map(({ key, value }) => {
      return {
        key,
        fr: value,
      };
    })
    .pipe(csvStream);
}

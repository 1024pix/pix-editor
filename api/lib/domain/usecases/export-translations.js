import csv from 'fast-csv';
import { translationRepository } from '../../infrastructure/repositories/index.js';

export async function exportTranslations(stream, dependencies = { translationRepository }) {
  const translationsStream = dependencies.translationRepository.streamList();
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(stream);
  translationsStream.pipe(csvStream);
}

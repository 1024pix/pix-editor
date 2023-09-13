import csv from 'fast-csv';
import { translationRepository } from '../../infrastructure/repositories/index.js';

export async function exportTranslations(stream, dependencies = { translationRepository }) {

  const translations = await dependencies.translationRepository.list();
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(stream);

  translations.forEach((translation)=> {
    csvStream.write(translation);
  });
  csvStream.end();
}

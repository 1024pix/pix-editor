import { translationRepository } from '../../infrastructure/repositories/index.js';
import { Translation } from '../models/index.js';
import { parseString } from 'fast-csv';

export async function importTranslations(csv, dependencies = { translationRepository }) {
  const parsedValue = await new Promise((resolve, reject)=> {
    const translations = [];
    parseString(csv, { headers: true })
      .on('error', (error) => reject(error))
      .on('data', (row) => translations.push(new Translation(row)))
      .on('end', () => resolve(translations));
  });

  await dependencies.translationRepository.save(parsedValue);
}

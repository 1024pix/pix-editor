import './job-process.js';
import { uploadTranslationsToWeblate, uploadTranslationToPhrase } from '../../domain/usecases/index.js';

export default async function uploadTranslationJobProcessor() {
  await uploadTranslationToPhrase();
  await uploadTranslationsToWeblate();
}

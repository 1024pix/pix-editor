import './job-process.js';
import { uploadTranslationToPhrase } from '../../domain/usecases/index.js';
import { uploadTranslationsToWeblate } from '../../domain/usecases/upload-translations-to-weblate.js';

export default async function uploadTranslationJobProcessor() {
  await uploadTranslationToPhrase();
  await uploadTranslationsToWeblate();
}

import './job-process.js';
import { uploadTranslationToPhrase } from '../../domain/usecases/index.js';
import { uploadTranslationsToWeblate } from '../../domain/usecases/upload-translations-to-weblate.js';
import * as config from '../../config.js';

export default async function uploadTranslationJobProcessor() {
  if (config.weblate.isEnabled) {
    await uploadTranslationsToWeblate();
  } else {
    await uploadTranslationToPhrase();
  }
}

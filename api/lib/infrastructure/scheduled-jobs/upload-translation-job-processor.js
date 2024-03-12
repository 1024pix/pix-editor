import './job-process.js';
import { uploadTranslationToPhrase } from '../../domain/usecases/index.js';

export default async function uploadTranslationJobProcessor() {
  await uploadTranslationToPhrase();
}

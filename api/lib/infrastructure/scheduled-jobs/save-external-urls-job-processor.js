import './job-process.js';
import { saveUrlsFromRelease } from '../../domain/usecases/index.js';
import {
  localizedChallengeRepository,
  releaseRepository,
  urlRepository,
  whitelistedUrlRepository,
} from '../repositories/index.js';
import * as UrlUtils from '../utils/url-utils.js';

export default function saveExternalUrlsJobProcessor() {
  return saveUrlsFromRelease({
    releaseRepository,
    urlRepository,
    localizedChallengeRepository,
    whitelistedUrlRepository,
    UrlUtils,
  });
}

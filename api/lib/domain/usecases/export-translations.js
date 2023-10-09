import { Readable } from 'node:stream';
import csv from 'fast-csv';
import { releaseRepository } from '../../infrastructure/repositories/index.js';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import { extractFromReleaseObject } from "../../infrastructure/translations/competence.js";

export async function exportTranslations(stream, dependencies = { releaseRepository }) {
  const release = await dependencies.releaseRepository.getLatestRelease();
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(stream);

  const challengesStream = Readable.from(release.content.challenges)
    .filter((challenge) => challenge.locales.includes('fr'))
    .flatMap(extractFromChallenge)
    .map(({ key, value }) => {
      return {
        key,
        fr: value,
      };
    });

  const competencesStream = Readable.from(release.content.competences)
    .flatMap(extractFromReleaseObject)
    .filter((translation) => translation.locale === 'fr')
    .map(({ key, value }) => {
      return {
        key,
        fr: value,
      };
    });

  challengesStream.pipe(csvStream);
  competencesStream.pipe(csvStream);
}

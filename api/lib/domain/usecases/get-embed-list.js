import {  pipeline, Readable } from 'node:stream';
import csv from 'fast-csv';
import { releaseRepository } from '../../infrastructure/repositories/index.js';
import { findUrlsInMarkdown } from '../../infrastructure/utils/url-utils.js';
import { logger } from '../../infrastructure/logger.js';

export async function getEmbedList(stream) {
  const release = await releaseRepository.getLatestRelease();
  const embedUrlsToCsv = findPixEpreuvesUrlsFromChallenges(release);

  const embedUrlWithToCsvHeader = [
    ['origin','competence', 'acquis' ,'challengeId', 'embedUrl', 'status'],
    ...embedUrlsToCsv
  ];

  pipeline(
    Readable.from(embedUrlWithToCsvHeader),
    csv.format({ headers: true }),
    stream,
    (error) => {
      if (!error) return;
      logger.error({ error }, 'Error while get embed list');
    },
  );
}

export function findPixEpreuvesUrlsFromChallenges(release) {
  const challenges = release.content.challenges;
  return challenges
    .flatMap((challenge) => {
      const functions = [
        (challenge) => findUrlsInMarkdown(challenge.instruction).filter((url) => url?.includes('epreuves.pix.fr')),
        (challenge) => [challenge.embedUrl].filter((url) => url?.includes('epreuves.pix.fr')),
      ];
      return functions
        .flatMap((fun) => fun(challenge))
        .map((url) => {
          return [
            release.findOriginForChallenge(challenge) ?? '',
            release.findCompetenceNameForChallenge(challenge) ?? '',
            release.findSkillNameForChallenge(challenge) ?? '',
            challenge.id,
            url,
            challenge.status,
          ];
        });
    })
    .sort(byUrl);
}

function byUrl([, , , , urlA], [, , , , urlB]) {
  return urlA.localeCompare(urlB);
}

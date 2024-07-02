import {  pipeline, Readable } from 'node:stream';
import _ from 'lodash';
import csv from 'fast-csv';
import { challengeRepository } from '../../infrastructure/repositories/index.js';
import { logger } from '../../infrastructure/logger.js';

export async function getEmbedList(stream, dependencies = { challengeRepository }) {
  const challenges = await dependencies.challengeRepository.list();
  const embedUrlsToCsv = extractEmbedUrlFromChallenges(challenges);

  const embedUrlWithToCsvHeader = [
    ['challengeId', 'embedUrl', 'status'],
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

export function extractEmbedUrlFromChallenges(challenges) {
  const embedList = [];
  for (const challenge of challenges) {
    const embedsFromChallenge = getEmbedFromChallenge(challenge);
    if (embedsFromChallenge.length) {
      embedsFromChallenge.forEach((embedUrl) => {
        embedList.push([
          challenge.id,
          embedUrl,
          challenge.status
        ]);
      });
    }
  }
  return embedList.sort(compareUrl);
}

function getEmbedFromChallenge(challenge) {
  const regex = /https:\/\/epreuves\.pix\.fr\/.*\.html/gm;
  const embedUrls = challenge.embedUrl && challenge.embedUrl.match(regex) ? [challenge.embedUrl] : [];
  const urlsFromInstruction = findUrlFromInstruction(regex, challenge.instruction);
  const allEmbedUrls =  urlsFromInstruction ? [...embedUrls, ...urlsFromInstruction] : embedUrls;
  return _.uniq(allEmbedUrls);
}

function findUrlFromInstruction(regexWithoutParam, instruction) {
  const regexWithOneParam = /https:\/\/epreuves\.pix\.fr\/.*\.html\?(mode|lang)+=\w+/gm;
  const regexWithTwoParam = /https:\/\/epreuves\.pix\.fr\/.*\.html\?(mode|lang)+=\w+&(mode|lang)+=\w+/gm;
  let url = instruction.match(regexWithTwoParam);
  if (url) {
    return url;
  }
  url = instruction.match(regexWithOneParam);
  if (url) {
    return url;
  }
  return instruction.match(regexWithoutParam);
}

function compareUrl([,urlA], [, urlB]) {
  if (urlA < urlB) {
    return -1;
  }
  if (urlA > urlB) {
    return 1;
  }
  return 0;
}

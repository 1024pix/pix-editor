import { challengeRepository } from '../../infrastructure/repositories/index.js';
import _ from 'lodash';

const CHALLENGE_STATUSES = {
  VALIDE: 'validé',
  PROPOSE: 'proposé',
  ARCHIVE: 'archivé',
  PERIME: 'périmé',
};

export async function getEmbedList(dependencies = { challengeRepository }) {

  const challenges = await dependencies.challengeRepository.list();
  const embedListByChallengeId = {};
  for (const challenge of challenges) {
    const embedsFromChallenge = getEmbedFRomChallenge(challenge);
    if (embedsFromChallenge.length) {
      embedsFromChallenge.forEach((embedName) => setChalengeIdsByStatusToEmbedName({ challenge, embedName, embedListByChallengeId }));
    }
  }
  return embedListByChallengeId;
}

function setChalengeIdsByStatusToEmbedName({ challenge, embedName, embedListByChallengeId }) {
  if (! embedListByChallengeId[embedName])  embedListByChallengeId[embedName] = {};

  switch (challenge.status) {
    case CHALLENGE_STATUSES.PROPOSE:
      if (!embedListByChallengeId[embedName].propose) embedListByChallengeId[embedName].propose = [];
      embedListByChallengeId[embedName].propose.push(challenge.id);
      break;
    case CHALLENGE_STATUSES.VALIDE:
      if (!embedListByChallengeId[embedName].valide) embedListByChallengeId[embedName].valide = [];
      embedListByChallengeId[embedName].valide.push(challenge.id);
      break;
    case CHALLENGE_STATUSES.ARCHIVE:
      if (!embedListByChallengeId[embedName].archive) embedListByChallengeId[embedName].archive = [];
      embedListByChallengeId[embedName].archive.push(challenge.id);
      break;
    case CHALLENGE_STATUSES.PERIME:
      if (!embedListByChallengeId[embedName].perime) embedListByChallengeId[embedName].perime = [];
      embedListByChallengeId[embedName].perime.push(challenge.id);
      break;
  }
}

function getEmbedFRomChallenge(challenge) {
  const regex = /https:\/\/epreuves\.pix\.fr\/.*\.html/gm;
  const embedUrls = challenge.embedUrl && challenge.embedUrl.match(regex) ? [challenge.embedUrl] : [];
  const urlsFromInstruction = challenge.instruction.match(regex);
  const allEmbedUrls =  urlsFromInstruction ? [...embedUrls, ...urlsFromInstruction] : embedUrls;
  return _.uniq(allEmbedUrls.map(getEmbedName));
}

function getEmbedName(embedUrl) {
  const urlParts = embedUrl.replace('https://epreuves.pix.fr/', '').split('/');
  if (isLocale(urlParts[0])) {
    return urlParts[1].replace('.html', '');
  }
  const regex = /[A-Za-z\-_0-9]*([#?]|\.html)/g;
  const match = embedUrl.match(regex);
  if (!match) return embedUrl;
  return match[0].replace('.html', '');
}

function isLocale(s) {
  try {
    new Intl.Locale(s);
    return true;
  } catch {
    return false;
  }
}

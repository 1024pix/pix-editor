import showdown from 'showdown';
import _ from 'lodash';
import urlRegex from 'url-regex-safe';
import axios from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';

import { logger } from '../../infrastructure/logger.js';

export function getLiveChallenges(release) {
  return release.challenges.filter((challenge) => challenge.status !== 'périmé');
}

export function findUrlsInstructionFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.instruction || '');
}

export function findUrlsProposalsFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.proposals || '');
}

export function findUrlsSolutionFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.solution || '');
}

export function findUrlsSolutionToDisplayFromChallenge(challenge) {
  return findUrlsInMarkdown(challenge.solutionToDisplay || '');
}

function cleanUrl(url) {
  const index = url.indexOf('</');
  if (index >= 0) {
    return url.substr(0, index);
  }
  return url;
}

function prependProtocol(url) {
  if (!url.includes('http')) {
    url = 'https://' + url;
  }
  return url;
}

export function findUrlsInMarkdown(value) {
  const converter = new showdown.Converter();
  const html = converter.makeHtml(value);
  const urls = html.match(urlRegex({ strict: true }));
  if (!urls) {
    return [];
  }
  return _.uniq(urls.map(cleanUrl).map(prependProtocol));
}

function findCompetenceNameFromChallenge(challenge, release) {
  const skill = release.skills.find(({ id }) => challenge.skillId === id);
  if (!skill) return '';
  return findCompetenceNameFromSkill(skill, release);
}

function findCompetencesNameFromTutorial(tutorial, release) {
  const skills = release.skills.filter((skill) => {
    return skill.tutorialIds.includes(tutorial.id) ||
      skill.learningMoreTutorialIds.includes(tutorial.id);
  });
  const competenceNames =  _.uniq(skills.map((skill) => skill ? findCompetenceNameFromSkill(skill, release) : ''));
  return competenceNames.join(' ');
}

function findCompetenceNameFromSkill(skill, release) {
  const tube = release.tubes.find(({ id }) => skill.tubeId === id);
  if (!tube) return '';
  const competence = release.competences.find(({ id }) => tube.competenceId === id);
  return competence?.name_i18n.fr || '';
}

function findSkillsNameFromChallenge(challenge, release) {
  const skills = release.skills.filter(({ id }) => challenge.skillId === id);
  return skills.map((s) => s.name).join(' ');
}

function findSkillsNameFromTutorial(tutorial, release) {
  const skills = release.skills.filter((skill) => {
    return skill.tutorialIds.includes(tutorial.id) ||
      skill.learningMoreTutorialIds.includes(tutorial.id);
  });
  return skills.map((s) => s.name).join(' ');
}

export function findUrlsFromChallenges(challenges, release) {
  return challenges.flatMap((challenge) => {
    const functions = [
      findUrlsInstructionFromChallenge,
      findUrlsProposalsFromChallenge,
      findUrlsSolutionFromChallenge,
      findUrlsSolutionToDisplayFromChallenge
    ];
    const urls = functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return { id: [findCompetenceNameFromChallenge(challenge, release), findSkillsNameFromChallenge(challenge, release), challenge.id, challenge.status].join(';'), url };
      });

    return _.uniqBy(urls, 'url');
  });
}

export function findUrlsFromTutorials(tutorials, release) {
  return tutorials.map((tutorial) => {
    return { id: [findCompetencesNameFromTutorial(tutorial, release), findSkillsNameFromTutorial(tutorial, release), tutorial.id].join(';'), url: tutorial.link };
  });
}

async function analyzeUrls(urlList) {
  const options = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.3; Win64; x64; rv:64.0) Gecko/20100101 Firefox/80.0',
      'Accept': '*/*'
    },
    timeout: 15000,
    maxRedirects: 10,
    bulk: 50,
  };
  const analyzedLines = await analyze(urlList, options);
  return analyzedLines;
}

async function analyze(lines, options) {
  const pMap = (await import('p-map')).default;
  const newLines = await pMap(lines, async (line) => {
    const config = { timeout: options.timeout, maxRedirects: options.maxRedirects, headers: options.headers };
    try {
      new URL(line.url);
    } catch (e) {
      return { id: line.id, url: line.url, status: 'KO', error: 'FORMAT_ERROR', comments: e.message };
    }
    try {
      logger.trace(`checking ${line.url}`);
      const response = await checkUrl(line.url, config);
      if (response.status === 200) {
        return { id: line.id, url: line.url, status: 'OK', error: '', comments: '' };
      } else {
        return {
          id: line.id,
          url: line.url,
          status: 'KO',
          error: 'HTTP_ERROR',
          comments: 'HTTP status is not 200'
        };
      }
    } catch (e) {
      return { id: line.id, url: line.url, status: 'KO', error: 'HTTP_ERROR', comments: e.message };
    } finally {
      logger.trace(`done checking ${line.url}`);
    }
  }, { concurrency: options.bulk });
  return newLines;
}

export async function checkUrl(url, config) {
  const jar = new CookieJar();
  const client = wrapper(axios.create({ jar }));
  try {
    return (await client.head(url, config));
  } catch (e) {
    return (await client.get(url, config));
  }
}

function getDataToUpload(analyzedLines) {
  return analyzedLines.filter((line) => {
    return line.status === 'KO';
  }).map((line) => {
    return [...line.id.split(';'), line.url, line.status, line.error, line.comments];
  });
}

export async function validateUrlsFromRelease({ releaseRepository, urlErrorRepository }) {
  const release = await releaseRepository.getLatestRelease();

  await checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository });
  await checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository });
}

async function checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository }) {
  const challenges = getLiveChallenges(release.content);

  const urlList = findUrlsFromChallenges(challenges, release.content);

  const analyzedLines = await analyzeUrls(urlList);
  const dataToUpload = getDataToUpload(analyzedLines);
  await urlErrorRepository.updateChallenges(dataToUpload);
}

async function checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository }) {
  const tutorials = release.content.tutorials;

  const urlList = findUrlsFromTutorials(tutorials, release.content);

  const analyzedLines = await analyzeUrls(urlList);
  const dataToUpload = getDataToUpload(analyzedLines);
  await urlErrorRepository.updateTutorials(dataToUpload);
}

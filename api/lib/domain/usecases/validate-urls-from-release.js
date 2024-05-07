import _ from 'lodash';

export async function validateUrlsFromRelease({ releaseRepository, urlErrorRepository, localizedChallengeRepository, UrlUtils }) {
  const release = await releaseRepository.getLatestRelease();

  await checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository, localizedChallengeRepository, UrlUtils });
  await checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository, UrlUtils });
}

function findCompetenceOriginAndNameFromChallenge(challenge, release) {
  const skill = release.skills.find(({ id }) => challenge.skillId === id);
  if (!skill) return ['', ''];
  return findCompetenceOriginAndNameFromSkill(skill, release);
}

function findCompetencesNameFromTutorial(tutorial, release) {
  const skills = release.skills.filter((skill) => {
    return skill.tutorialIds.includes(tutorial.id) ||
      skill.learningMoreTutorialIds.includes(tutorial.id);
  });
  const competenceNames =  _.uniq(skills.map((skill) => skill ? findCompetenceNameFromSkill(skill, release) : ''));
  return competenceNames.join(' ');
}

function findCompetenceFromSkill(skill, release) {
  const tube = release.tubes.find(({ id }) => skill.tubeId === id);
  if (!tube) return '';
  return release.competences.find(({ id }) => tube.competenceId === id);
}

function findCompetenceNameFromSkill(skill, release) {
  const competence = findCompetenceFromSkill(skill, release);
  return competence?.name_i18n.fr ?? '';
}

function findCompetenceOriginAndNameFromSkill(skill, release) {
  const competence = findCompetenceFromSkill(skill, release);
  return [competence?.origin ?? '', competence?.name_i18n.fr ?? ''];
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

function findUrlsFromChallenges(challenges, release, localizedChallengesById, UrlUtils) {
  return challenges.flatMap((challenge) => {
    const functions = [
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.instruction),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.proposals),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.solution),
      (challenge) => UrlUtils.findUrlsInMarkdown(challenge.solutionToDisplay),
      (challenge) => localizedChallengesById[challenge.id].urlsToConsult ?? [],
    ];
    const urls = functions
      .flatMap((fun) => fun(challenge))
      .map((url) => {
        return { id: [findCompetenceOriginAndNameFromChallenge(challenge, release).join(';'), findSkillsNameFromChallenge(challenge, release), challenge.id, challenge.status, challenge.locales[0]].join(';'), url };
      });
    return _.uniqBy(urls, 'url');
  });
}

function findUrlsFromTutorials(tutorials, release) {
  return tutorials.map((tutorial) => {
    return { id: [findCompetencesNameFromTutorial(tutorial, release), findSkillsNameFromTutorial(tutorial, release), tutorial.id].join(';'), url: tutorial.link };
  });
}

function getDataToUpload(analyzedLines) {
  return analyzedLines.filter((line) => {
    return line.status === 'KO';
  }).map((line) => {
    return [...line.id.split(';'), line.url, line.status, line.error, line.comments];
  });
}

async function checkAndUploadKOUrlsFromChallenges(release, { urlErrorRepository, localizedChallengeRepository, UrlUtils }) {
  const operativeChallenges = release.operativeChallenges;
  const localizedChallengesById = _.keyBy(await localizedChallengeRepository.list(), 'id');
  const urlList = findUrlsFromChallenges(operativeChallenges, release.content, localizedChallengesById, UrlUtils);
  const analyzedLines = await UrlUtils.analyzeIdentifiedUrls(urlList);
  const dataToUpload = getDataToUpload(analyzedLines);
  await urlErrorRepository.updateChallenges(dataToUpload);
}

async function checkAndUploadKOUrlsFromTutorials(release, { urlErrorRepository, UrlUtils }) {
  const tutorials = release.content.tutorials;
  const urlList = findUrlsFromTutorials(tutorials, release.content);
  const analyzedLines = await UrlUtils.analyzeIdentifiedUrls(urlList);
  const dataToUpload = getDataToUpload(analyzedLines);
  await urlErrorRepository.updateTutorials(dataToUpload);
}

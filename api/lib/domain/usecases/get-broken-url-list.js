import { list } from '../../infrastructure/repositories/broken-url-read-repository.js';
import { getChallengesFromUrl, getTutorialsFromUrl } from '../../infrastructure/repositories/url-repository.js';

export async function getBrokenUrlList() {
  const brokenUrlList = await list();
  const urlToFindList = brokenUrlList.map((url) => url.url);

  // Challenges
  const challenges = await getChallengesFromUrl(urlToFindList);

  // Tutorials
  const tutorials = await getTutorialsFromUrl(urlToFindList);

  return brokenUrlList.map((brokenUrl) => ({
    id: brokenUrl.id,
    url: brokenUrl.url,
    statusCode: brokenUrl.statusCode,
    errorMessage: brokenUrl.errorMessage,
    challenges: challenges.filter((challenge) => challenge.url === brokenUrl.url),
    tutorials: tutorials.filter((tutorial) => tutorial.link === brokenUrl.url),
  }));
}


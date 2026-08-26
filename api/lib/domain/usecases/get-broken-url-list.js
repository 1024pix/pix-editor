import { list } from '../../infrastructure/repositories/broken-url-repository.js';
import { getChallengesFromUrl, getTutorialsFromUrl } from '../../infrastructure/repositories/url-repository.js';

export async function getBrokenUrlList() {
  const brokenUrls = await list();

  const urlToFind = brokenUrls.map((url) => url.url);

  // Challenges
  const challenges = await getChallengesFromUrl(urlToFind);

  // Tutorials
  const tutorials = await getTutorialsFromUrl(urlToFind);

  return {
    challenges,
    tutorials,
  };
}


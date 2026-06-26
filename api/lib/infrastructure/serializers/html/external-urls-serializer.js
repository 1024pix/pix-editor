
export function serialize({ challengeExternalUrls, tutorialExternalUrls }) {
  const challengeUrls = challengeExternalUrls.map(({ challenge_id, url }) => {
    return `<a href="${url}">c ${challenge_id.split(', ')[0]}</a>`;
  }).join('');
  const tutorialUrls = tutorialExternalUrls.map(({ tutorial_id, url }) => {
    return `<a href="${url}">t ${tutorial_id.split(', ')[0]}</a>`;
  }).join('');

  return `<!DOCTYPE html><html><body>${challengeUrls}${tutorialUrls}</body><style>a{display:block;}</style></html>`;
}

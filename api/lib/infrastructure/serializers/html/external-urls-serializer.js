
export function serialize({ challengeExternalUrls, tutorialExternalUrls }) {
  const challengeUrls = challengeExternalUrls.map(({ skill_name, challenge_id, url }) => {
    return `<li><a href="${url}">Épreuve | Acquis: ${skill_name}, ChallengeId: ${challenge_id}</a></li>`;
  }).join('');
  const tutorialUrls = tutorialExternalUrls.map(({ skill_name, tutorial_id, url }) => {
    return `<li><a href="${url}">Tutoriel | Acquis: ${skill_name}, TutorialId: ${tutorial_id}</a></li>`;
  }).join('');

  return `<!DOCTYPE html><html><body><ul>${challengeUrls}${tutorialUrls}</ul></body></html>`;
}

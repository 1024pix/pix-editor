module.exports = function buildTutorial(
  {
    id = 'receomyzL0AmpMFGw',
    duration = '00:03:31',
    format = 'vidéo',
    link = 'http://www.example.com/this-is-an-example.html',
    source = 'Source Example, Example',
    title = 'Communiquer',
    locale = 'fr-fr',
    tutorialForSkills = ['skillId1'],
    furtherInformation = ['skillId2'],
  } = {}) {
  return {
    id,
    duration,
    format,
    link,
    source,
    title,
    locale,
    tutorialForSkills,
    furtherInformation,
  };
};

const faker = require('faker');
const buildSkillCollection = require('./build-skill-collection');

const Challenge = {
  Type: { QCM: 'QCM' }
};

module.exports = function buildChallenge(
  {
    id = faker.random.uuid(),
    // attributes
    attachments,
    embedHeight,
    embedTitle,
    embedUrl,
    format,
    illustrationUrl,
    instruction,
    proposals,
    status = 'validé',
    timer,
    type = Challenge.Type.QCM,
    // includes
    answer,
    skills = buildSkillCollection(),
    // references
    competenceId = faker.random.uuid(),
    illustrationAlt,
  } = {}) {
  return {
    id,
    // attributes
    attachments,
    embedHeight,
    embedTitle,
    embedUrl,
    format,
    illustrationUrl,
    instruction,
    proposals,
    status,
    timer,
    type,
    // includes
    answer,
    skills,
    // references
    competenceId,
    illustrationAlt,
  };
};

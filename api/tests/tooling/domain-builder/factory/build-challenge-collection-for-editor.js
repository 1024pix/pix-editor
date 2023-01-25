const ChallengeCollectionForEditor = require('../../../../lib/domain/models/ChallengeCollectionForEditor');
const buildChallengeForEditor = require('./build-challenge-for-editor');

const buildChallengeCollectionForEditor = function({
  version = 1,
  skillId = 'skillId',
  challenges,
} = {}) {
  const theChallenges = challenges.length > 0 ? challenges : [buildChallengeForEditor({ version })];
  return new ChallengeCollectionForEditor({
    version,
    skillId,
    challenges: theChallenges,
  });
};

buildChallengeCollectionForEditor.withOneValidatedPrototype = function({
  version,
  skillId,
} = {}) {
  const challenge = buildChallengeForEditor.validatedPrototype({ version });
  return buildChallengeCollectionForEditor({
    version,
    skillId,
    challenges: [challenge],
  });
};

module.exports = buildChallengeCollectionForEditor;

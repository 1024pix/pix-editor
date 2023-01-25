const SkillForEditor = require('../../../../lib/domain/models/SkillForEditor');
const buildChallengeCollectionForEditor = require('./build-challenge-collection-for-editor');

const buildSkillForEditor = function({
  airtableId = 'skillAirtableId',
  id = 'skillId',
  name = '@mangerDesFruits5',
  level = 5,
  status = 'actif',
  challengeCollections,
} = {}) {
  const theChallengeCollections = challengeCollections.length > 0
    ? challengeCollections
    : [buildChallengeCollectionForEditor({ skillId: id })];
  const skill = new SkillForEditor({
    airtableId,
    id,
    name,
    level,
    status,
  });
  for (const challengeCollection of theChallengeCollections) skill.addChallengeCollection(challengeCollection);
  return skill;
};

buildSkillForEditor.active = function({
  airtableId,
  id,
  name,
  level,
  challengeCollections,
} = {}) {
  return buildSkillForEditor({
    airtableId,
    id,
    name,
    level,
    status: 'actif',
    challengeCollections,
  });
};

buildSkillForEditor.workbench = function({
  airtableId,
  id,
  challengeCollections,
} = {}) {
  return buildSkillForEditor({
    airtableId,
    id,
    name: '@workbench',
    level: null,
    status: 'osef',
    challengeCollections,
  });
};

buildSkillForEditor.draft = function({
  airtableId,
  id,
  name,
  level,
  challengeCollections,
} = {}) {
  return buildSkillForEditor({
    airtableId,
    id,
    name,
    level,
    status: 'en construction',
    challengeCollections,
  });
};

module.exports = buildSkillForEditor;

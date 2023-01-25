const TubeForEditor = require('../../../../lib/domain/models/TubeForEditor');
const buildSkillForEditor = require('./build-skill-for-editor');

const buildTubeForEditor = function({
  id = 'tubeId',
  skills,
} = {}) {
  const theSkills = skills.length > 0
    ? skills
    : [buildSkillForEditor()];
  return new TubeForEditor({
    id,
    skills: theSkills,
  });
};

module.exports = buildTubeForEditor;

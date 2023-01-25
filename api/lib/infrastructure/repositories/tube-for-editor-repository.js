const _ = require('lodash');
const airtable = require('../airtable');
const SkillForEditor = require('../../domain/models/SkillForEditor');
const ChallengeCollectionForEditor = require('../../domain/models/ChallengeCollectionForEditor');
const ChallengeForEditor = require('../../domain/models/ChallengeForEditor');
const TubeForEditor = require('../../domain/models/TubeForEditor');

module.exports = {
  async getByChallengeId(challengeId) {
    const airtableRawObjects1 = await airtable.findRecord(
      'Epreuves',
      {
        fields: ['Acquix (id persistant)'],
        filterByFormula: `{id persistant} = "${challengeId}"`,
      });
    if (!airtableRawObjects1) return null;
    const skillId = airtableRawObjects1[0].fields['Acquix (id persistant)']?.[0];

    const airtableRawObjects2 = await airtable.findRecord(
      'Acquis',
      {
        fields: ['Tube (id persistant)'],
        filterByFormula: `{id persistant} = "${skillId}"`,
      });
    if (!airtableRawObjects2) return null;
    const tubeId = airtableRawObjects2[0].fields['Tube (id persistant)']?.[0];

    const airtableRawSkills = await airtable.findRecords(
      'Acquis',
      {
        fields: ['id persistant', 'Nom', 'Status', 'Level'],
        filterByFormula: `SEARCH("${tubeId}", ARRAYJOIN({Tube (id persistant)}))`,
      });
    const skillIds = airtableRawSkills.map(({ fields }) => fields['id persistant']);
    const airtableRawChallenges = await airtable.findRecords(
      'Epreuves',
      {
        fields: ['id persistant', 'Généalogie', 'Statut', 'Version prototype', 'Acquix (id persistant)'],
        filterByFormula: 'OR(' + skillIds.map((id) => `SEARCH("${id}", ARRAYJOIN({Acquix (id persistant)}))`).join(',') + ')',
      });
    const skills = [];
    for (const airtableRawSkill of airtableRawSkills) {
      const skill = new SkillForEditor({
        airtableId: airtableRawSkill.id,
        id: airtableRawSkill.fields['id persistant'],
        name: airtableRawSkill.fields['Nom'],
        level: airtableRawSkill.fields['Level'],
        status: airtableRawSkill.fields['Status'],
      });
      const airtableChallengesForSkill = airtableRawChallenges.filter(({ fields }) => fields['Acquix (id persistant)']?.[0] === skill.id);
      const challenges = airtableChallengesForSkill.map((airtableRawChallenge) => {
        return new ChallengeForEditor({
          airtableId: airtableRawChallenge.id,
          id: airtableRawChallenge.fields['id persistant'],
          status: airtableRawChallenge.fields['Statut'],
          genealogy: airtableRawChallenge.fields['Généalogie'],
          version: airtableRawChallenge.fields['Version prototype'],
        });
      });
      const challengesByVersion = _.groupBy(challenges, 'version');
      for (const challengesOfSameVersion of Object.values(challengesByVersion)) {
        skill.addChallengeCollection(new ChallengeCollectionForEditor({
          challenges: challengesOfSameVersion,
        }));
      }
      skills.push(skill);
    }
    return new TubeForEditor({
      id: tubeId,
      skills,
    });
  },

  async save(tube) {
    const tubeDTO = tube.toDTO();
    const { skillData, challengeData } = _buildSkillAndChallengeDataToSave(tubeDTO.skills);
    await airtable.updateRecords('Acquis', skillData);
    await airtable.updateRecords('Epreuves', challengeData);
  }
};

function _buildSkillAndChallengeDataToSave(skillsDTO) {
  const skillData = [];
  const challengeData = [];
  for (const skillDTO of skillsDTO) {
    skillData.push({
      id: skillDTO.airtableId,
      fields: {
        'Level': skillDTO.level,
        'Status': skillDTO.status,
      },
    });
    for (const challengeDTO of skillDTO.challenges) {
      challengeData.push({
        id: challengeDTO.airtableId,
        fields: {
          'Généalogie': challengeDTO.genealogy,
          'Statut': challengeDTO.status,
          'Version prototype': challengeDTO.version,
        },
      });
    }
  }
  return { skillData, challengeData };
}

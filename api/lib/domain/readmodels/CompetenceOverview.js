export class CompetenceOverview {
  constructor({
    id,
    thematicOverviews,
  }) {
    this.id = id;
    this.thematicOverviews = thematicOverviews;
  }

  static buildForChallengesProduction({ competenceId, thematics, tubes, skills }) {
    const tubesById = Object.fromEntries(tubes.map((tube) => [tube.id, tube]));
    const skillsByTubeIdAndLevel = arrangeSkillsByTubeIdAndLevel(skills);

    return new CompetenceOverview({
      id: `${competenceId}-challenges-production-fr`,
      thematicOverviews: thematics
        .sort(byIndex)
        .map((thematic) => new ThematicOverview({
          airtableId: thematic.airtableId,
          name: thematic.name_i18n.fr,
          tubeOverviews: thematic.tubeIds
            .map((tubeId) => tubesById[tubeId])
            .sort(byIndex)
            .map((tube) => new TubeOverview({
              airtableId: tube.airtableId,
              name: tube.name,
              skillOverviews: skillsByTubeIdAndLevel[tube.id]
                ?.map((skill) => skill && new SkillOverview({
                  airtableId: skill.airtableId,
                  name: skill.name,
                })),
            }))
            .filter((tubeOverview) => tubeOverview.skillOverviews)
        }))
        .filter((thematicOverview) => thematicOverview.tubeOverviews.length),
    });
  }
}

class ThematicOverview {
  constructor({
    airtableId,
    name,
    tubeOverviews,
  }) {
    this.airtableId = airtableId;
    this.name = name;
    this.tubeOverviews = tubeOverviews;
  }
}

class TubeOverview {
  constructor({
    airtableId,
    name,
    skillOverviews,
  }) {
    this.airtableId = airtableId;
    this.name = name;
    this.skillOverviews = skillOverviews;
  }
}

class SkillOverview {
  constructor({
    airtableId,
    name,
  }) {
    this.airtableId = airtableId;
    this.name = name;
  }
}

function byIndex({ index: index1 }, { index: index2 }) {
  return index1 - index2;
}

function arrangeSkillsByTubeIdAndLevel(skills) {
  const skillsByTubeIdAndLevel = [];

  for (const skill of skills) {
    if (!skillsByTubeIdAndLevel[skill.tubeId]) {
      skillsByTubeIdAndLevel[skill.tubeId] = Array.from({ length:7 }, () => null);
    }
    skillsByTubeIdAndLevel[skill.tubeId][skill.level - 1] = skill;
  }

  return skillsByTubeIdAndLevel;
}

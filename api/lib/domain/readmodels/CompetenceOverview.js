export class CompetenceOverview {
  constructor({
    id,
    thematicOverviews,
  }) {
    this.id = id;
    this.thematicOverviews = thematicOverviews;
  }

  static buildForChallengesProduction({ competenceId, thematics, tubes }) {
    const tubesById = Object.fromEntries(tubes.map((tube) => [tube.id, tube]));

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
            }))
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
  }) {
    this.airtableId = airtableId;
    this.name = name;
  }
}

function byIndex({ index: index1 }, { index: index2 }) {
  return index1 - index2;
}

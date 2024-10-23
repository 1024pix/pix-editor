export class CompetenceOverview {
  constructor({
    id,
    thematicOverviews,
  }) {
    this.id = id;
    this.thematicOverviews = thematicOverviews;
  }

  static buildForChallengesProduction({ competenceId, thematics }) {
    return new CompetenceOverview({
      id: `${competenceId}-challenges-production-fr`,
      thematicOverviews: thematics.sort(byIndex).map((thematic) => new ThematicOverview({
        airtableId: thematic.airtableId,
        name: thematic.name_i18n.fr,
      })),
    });
  }
}

class ThematicOverview {
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

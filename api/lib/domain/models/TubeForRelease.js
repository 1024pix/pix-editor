module.exports = class TubeForRelease {
  constructor({
    id,
    name,
    title,
    description,
    practicalTitleFrFr,
    practicalTitleEnUs,
    practicalDescriptionFrFr,
    practicalDescriptionEnUs,
    competenceId,
    isMobileCompliant,
    isTabletCompliant,
  }) {
    this.id = id;
    this.name = name;
    this.title = title;
    this.description = description;
    this.practicalTitleFrFr = practicalTitleFrFr;
    this.practicalTitleEnUs = practicalTitleEnUs;
    this.practicalDescriptionFrFr = practicalDescriptionFrFr;
    this.practicalDescriptionEnUs = practicalDescriptionEnUs;
    this.competenceId = competenceId;
    this.isMobileCompliant = isMobileCompliant;
    this.isTabletCompliant = isTabletCompliant;

    this.practicalTitle_i18n = _computePracticalTitleForI18N({ practicalTitleFrFr, practicalTitleEnUs });
    this.practicalDescription_i18n = _computePracticalDescriptionForI18N({ practicalDescriptionFrFr, practicalDescriptionEnUs });
  }
};

function _computePracticalTitleForI18N({ practicalTitleFrFr, practicalTitleEnUs }) {
  return {
    fr: practicalTitleFrFr,
    en: practicalTitleEnUs,
  };
}

function _computePracticalDescriptionForI18N({ practicalDescriptionFrFr, practicalDescriptionEnUs }) {
  return {
    fr: practicalDescriptionFrFr,
    en: practicalDescriptionEnUs,
  };
}


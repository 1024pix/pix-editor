import Model, { attr } from '@ember-data/model';

const visibilityForDisplay = {
  public: 'Public',
  private: 'Privé',
};

const levelForDisplay = {
  novice: 'Novice',
  independent: 'Indépendant',
  advanced: 'Avancé',
  expert: 'Expert',
};

export default class Module extends Model {
  @attr internalTitle;
  @attr title;
  @attr isBeta;
  @attr slug;
  @attr visibility;
  @attr details;
  @attr sections;
  @attr glossary;

  get visibilityForDisplay() {
    return visibilityForDisplay[this.visibility] ?? this.visibility;
  }

  get levelForDisplay() {
    return levelForDisplay[this.details.level] ?? this.details.level;
  }

  get mayShowProductionDetails() {
    return true;
  }
}

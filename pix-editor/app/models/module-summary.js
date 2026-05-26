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

export default class ModuleSummary extends Model {
  @attr internalTitle;
  @attr isBeta;
  @attr visibility;
  @attr level;

  get visibilityForDisplay() {
    return visibilityForDisplay[this.visibility] ?? this.visibility;
  }

  get levelForDisplay() {
    return levelForDisplay[this.level] ?? this.level;
  }
}

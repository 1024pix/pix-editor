import Model, { attr } from '@warp-drive/legacy/model';

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

export default class BaseModule extends Model {
  @attr shortId;
  @attr internalTitle;
  @attr title;
  @attr isBeta;
  @attr slug;
  @attr visibility;
  @attr details;
  @attr sections;
  @attr glossary;
  @attr url;
  @attr previewUrl;

  get visibilityForDisplay() {
    return visibilityForDisplay[this.visibility] ?? this.visibility;
  }

  get levelForDisplay() {
    return levelForDisplay[this.details.level] ?? this.details.level;
  }

  get isDraft() {
    throw new TypeError('isDraft must be overriden');
  }

  get isEditionDraft() {
    throw new TypeError('isEditionDraft must be overriden');
  }
}

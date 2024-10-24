import { attr } from '@ember-data/model';

import MissionSummary from './mission-summary';

export default class Mission extends MissionSummary {
  @attr cardImageUrl;
  @attr competenceId;
  @attr thematicIds;
  @attr learningObjectives;
  @attr validatedObjectives;
  @attr introductionMediaUrl;
  @attr introductionMediaType;
  @attr introductionMediaAlt;
  @attr documentationUrl;
  @attr warnings;

  hasWarnings() {
    return this.warnings?.length > 0;
  }
}

import { attr } from '@ember-data/model';
import MissionSummary from './mission-summary';

export default class Mission extends MissionSummary {
  @attr competenceId;
  @attr thematicIds;
  @attr learningObjectives;
  @attr validatedObjectives;
  @attr introductionMediaUrl;
  @attr introductionMediaType;
  @attr introductionMediaAlt;
}

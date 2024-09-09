import Model, { attr } from '@ember-data/model';

export default class AtelierSkillVersionViewModel extends Model {

  @attr status;
  @attr validatedPrototypesCount;
  @attr proposedPrototypesCount;
  @attr archivedPrototypesCount;
  @attr obsoletePrototypesCount;

}

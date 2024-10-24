import Model, { attr } from '@ember-data/model';

export default class WhitelistedUrlModel extends Model {
  @attr url;
  @attr creatorName;
  @attr latestUpdatorName;
  @attr relatedEntityIds;
  @attr comment;
  @attr createdAt;
  @attr updatedAt;
}

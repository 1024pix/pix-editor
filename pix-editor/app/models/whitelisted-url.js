import Model, { attr } from '@warp-drive/legacy/model';

export default class WhitelistedUrlModel extends Model {
  @attr url;
  @attr creatorName;
  @attr latestUpdatorName;
  @attr relatedSkillNames;
  @attr checkType;
  @attr comment;
  @attr createdAt;
  @attr updatedAt;
}

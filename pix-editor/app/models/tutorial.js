import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class TutorialModel extends Model {
  @attr title;
  @attr duration;
  @attr source;
  @attr format;
  @attr link;
  @attr license;
  @attr level;
  @attr crush;
  @attr pixId;
  @attr language;

  @hasMany('tag', { async: true, inverse: null }) tags;

  get tagsTitle() {
    const tags = this.hasMany('tags').value() || [];
    return tags.map((tag) => tag.title).join(' | ');
  }
}

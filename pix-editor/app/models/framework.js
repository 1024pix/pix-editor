import Model, { attr, hasMany } from '@ember-data/model';

export default class FrameworkModel extends Model {

  static pixJuniorFrameworkName = 'Pix Junior';

  @attr name;
  @hasMany('area', { async: true, inverse: 'framework' }) areas;

  get sortedAreas() {
    const areas = this.hasMany('areas').value();

    if (areas === null) return [];

    return areas
      .slice()
      .sort((areaA, areaB) => parseInt(areaA.code) - parseInt(areaB.code));
  }
}

import Model, { attr, hasMany } from '@ember-data/model';

class FrameworkModel extends Model {

  static pix1DFrameworkName = 'Pix 1D';
  @attr name;
  @hasMany('area') areas;

  get sortedAreas() {
    return this.areas
      .toArray()
      .sort((areaA, areaB) => parseInt(areaA.code) - parseInt(areaB.code));
  }
}

export default FrameworkModel;

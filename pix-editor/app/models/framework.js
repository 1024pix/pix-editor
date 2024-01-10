import Model, { attr, hasMany } from '@ember-data/model';

const pix1DFrameworkName = 'Pix 1D';
class FrameworkModel extends Model {

  @attr name;
  @hasMany('area') areas;

  get sortedAreas() {
    return this.areas
      .toArray()
      .sort((areaA, areaB) => parseInt(areaA.code) - parseInt(areaB.code));
  }
}

FrameworkModel.pix1DFrameworkName = pix1DFrameworkName;
export default FrameworkModel;

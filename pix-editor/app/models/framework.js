import Model, { attr, hasMany } from '@ember-data/model';

const pix1DFrameworkName = 'Pix 1D';
class FrameworkModel extends Model {

  static pix1DFrameworkName = 'Pix 1D';
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

FrameworkModel.pix1DFrameworkName = pix1DFrameworkName;
export default FrameworkModel;

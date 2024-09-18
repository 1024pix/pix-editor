import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class AreaModel extends Model {
  @attr({ readOnly: true }) name;
  @attr pixId;
  @attr titleFrFr;
  @attr titleEnUs;
  @attr code;

  @hasMany('competence', { async: true, inverse: 'area' }) competences;
  @belongsTo('framework', { async: true, inverse: 'areas' }) framework;

  get sortedCompetences() {
    const competences = this.competencesArray;

    return competences
      .slice()
      .sort((competenceA, competenceB) => {
        const [domainCodeA, competenceCodeA] = competenceA.code.split('.');
        const [domainCodeB, competenceCodeB] = competenceB.code.split('.');
        if (parseInt(domainCodeA) === parseInt(domainCodeB))
          return parseInt(competenceCodeA) - parseInt(competenceCodeB);
        return parseInt(domainCodeA) - parseInt(domainCodeB);
      });
  }

  get competencesArray() {
    return this.hasMany('competences').value() || [];
  }

  get productionTubeCount() {
    return this.competencesArray.reduce((count, competence) => {
      return count + competence.productionTubeCount;
    }, 0);
  }

  get selectedProductionTubeCount() {
    return this.competencesArray.reduce((count, competence) => {
      return count + competence.selectedProductionTubeCount;
    }, 0);
  }
  get selectedThematicResultTubeCount() {
    return this.competencesArray.reduce((count, competence) => {
      return count + competence.selectedThematicResultTubeCount;
    }, 0);
  }

  get source() {
    return this.competencesArray[0].source;
  }
}

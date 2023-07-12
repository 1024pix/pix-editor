import Model, { attr, belongsTo, hasMany } from '@ember-data/model';

export default class AreaModel extends Model {
  @attr({ readonly: true }) name;
  @attr pixId;
  @attr titleFrFr;
  @attr titleEnUs;
  @attr() code;

  @hasMany('competence') competences;
  @belongsTo('framework') framework;

  get sortedCompetences() {
    return this.competences
      .toArray()
      .sort((competenceA, competenceB) => {
        const [domainCodeA, competenceCodeA] = competenceA.code.split('.');
        const [domainCodeB, competenceCodeB] = competenceB.code.split('.');
        if (parseInt(domainCodeA) === parseInt(domainCodeB))
          return parseInt(competenceCodeA) > parseInt(competenceCodeB);
        return parseInt(domainCodeA) > parseInt(domainCodeB);
      });
  }

  get productionTubeCount() {
    return this.competences.reduce((count, competence) => {
      return count + competence.productionTubeCount;
    }, 0);
  }

  get selectedProductionTubeCount() {
    return this.competences.reduce((count, competence) => {
      return count + competence.selectedProductionTubeCount;
    }, 0);
  }
  get selectedThematicResultTubeCount() {
    return this.competences.reduce((count, competence) => {
      return count + competence.selectedThematicResultTubeCount;
    }, 0);
  }

  get source() {
    return this.competences.firstObject.source;
  }
}

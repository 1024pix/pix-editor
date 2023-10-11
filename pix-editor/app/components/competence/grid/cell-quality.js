import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';

export default class CellQuality extends Component {

  get qualityIndication() {
    if (this.loadingChallenges) return null;
    const productionPrototype = this.args.skill.productionPrototype;
    const allWeight = 19;
    const spoil = this._spoilWeight(productionPrototype.spoil);
    const responsive = this._responsiveWeight(productionPrototype.responsive);
    const colorblind = this._colorblindWeight(productionPrototype.accessibility2);
    const a11Y = this._a11YWeight(productionPrototype.accessibility1);
    const clue = this._clueWeight(this.args.skill.clueStatus);

    const result = (spoil + responsive + colorblind + a11Y + clue) / allWeight;
    return Math.round(result * 100);
  }

  get loadingChallenges() {
    return this.args.skill.challenges.isPending;
  }

  get qualityClassColor() {
    if (this.loadingChallenges) {
      return 'quality loading';
    }
    const qualityIndication = this.qualityIndication;
    if (qualityIndication < 50) {
      return 'quality bad-quality';
    }
    if (qualityIndication < 80) {
      return 'quality medium-quality';
    }
    return 'quality good-quality';
  }

  get classTutorial() {
    const hasTutoSolution = this.args.skill.tutoSolution.length > 0;
    const hasTutoMore = this.args.skill.tutoMore.length > 0;
    if (hasTutoSolution && hasTutoMore) {
      return 'have-tutorial';
    }
    if (hasTutoSolution || hasTutoMore) {
      return 'half-tutorial';
    }
    return false;
  }

  get popupBuild() {
    const productionPrototype = this.args.skill.productionPrototype;
    const spoil = this._isNonTested(productionPrototype.spoil);
    const responsive = this._isNonTested(productionPrototype.responsive);
    const blind = this._isNonTested(productionPrototype.accessibility1);
    const colorblind = this._isNonTested(productionPrototype.accessibility2);
    const skillClue = this.args.skill.clueStatus;
    const clue = skillClue ? skillClue : 'Pas d\'indice';
    const skillTimer = productionPrototype.timer;
    const timer = skillTimer ? `<tr><td>Timer</td><td>${skillTimer} s</td></tr>` : '';
    const classTuto = this.classTutorial;
    const tutoSolutionCount = this.args.skill.tutoSolution.length;
    const tutoMoreCount = this.args.skill.tutoMore.length;
    const haveTuto = classTuto ? `<tr><td>Tuto comprendre </td><td> ${tutoSolutionCount}</td></tr>
                                <tr><td>Tuto en savoir + </td><td> ${tutoMoreCount}</td></tr>` : '';
    return htmlSafe(`<tr><td>Spoil </td><td> ${spoil} </td></tr>
            <tr><td>Responsive </td><td> ${responsive} </td></tr>
            <tr><td>Non/Mal voyant </td><td> ${blind} </td></tr>
            <tr><td>Daltonien </td><td> ${colorblind} </td></tr>
            <tr><td>Indice </td><td> ${clue} </td></tr>
            ${haveTuto}
            ${timer}`);
  }

  _spoilWeight(spoil) {
    const weight = 5;
    const quality = {
      'Non Sp': 3,
      'Difficilement Sp': 2,
      'Facilement Sp': 1,
      'default': 0
    };
    return (quality[spoil] || quality['default']) / 3 * weight;
  }

  _responsiveWeight(responsive) {
    const weight = 4;
    const quality = {
      'Tablette': 1,
      'Smartphone': 1,
      'Tablette/Smartphone': 2,
      'default': 0
    };
    return (quality[responsive] || quality['default']) / 2 * weight;
  }

  _colorblindWeight(colorblind) {
    const weight = 3;
    const quality = {
      'RAS': 1,
      'OK': 1,
      'default': 0
    };
    return (quality[colorblind] || quality['default']) * weight;
  }

  _a11YWeight(a11Y) {
    const weight = 3;
    const quality = {
      'RAS': 2,
      'OK': 2,
      'Acquis Non Pertinent': 2,
      'KO': 0,
      'default': 0
    };
    return (quality[a11Y] || quality['default']) / 2 * weight;
  }

  _clueWeight(clue) {
    const weight = 4;
    const quality = {
      'Validé': 4,
      'pré-validé': 3,
      'Proposé': 2,
      'à soumettre': 2,
      'à retravailler': 1,
      'archiver': 0,
      'default': 0
    };
    return (quality[clue] || quality['default']) / 4 * weight;
  }

  _isNonTested(skillDetail) {
    if (skillDetail) {
      return skillDetail;
    }
    return 'Non testé';
  }
}

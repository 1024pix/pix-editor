import Component from '@ember/component';
import {computed} from '@ember/object';
import { htmlSafe } from '@ember/template';

export default Component.extend({
  tagName: '',
  qualityIndication: computed('skill.productionTemplate.{spoil,responsive,accessibility1,accessibility2}','skill.clueStatus', function (){
    const productionTemplate = this.get('skill.productionTemplate');
    const allWeight = 19;
    const spoil = this._spoilWeight(productionTemplate.get('spoil'));
    const responsive = this._responsiveWeight(productionTemplate.get('responsive'));
    const colorblind = this._colorblindWeight(productionTemplate.get('accessibility2'));
    const a11Y = this._a11YWeight(productionTemplate.get('accessibility1'));
    const clue = this._clueWeight(this.get('skill.clueStatus'));

    const result = (spoil + responsive + colorblind + a11Y + clue) / allWeight;
    return Math.round(result * 100);
  }),
  qualityClassColor: computed('qualityIndication', function () {
    const qualityIndication = this.get('qualityIndication');
    if (qualityIndication < 50) {
      return 'quality bad-quality';
    }
    if (qualityIndication < 80) {
      return 'quality medium-quality';
    }
    return 'quality good-quality';
  }),
  classTutorial: computed("skill.{tutoSolutionCount,tutoMoreCount}", function () {
    const tutoSolution = this.get('skill.tutoSolutionCount');
    const tutoMore = this.get('skill.tutoMoreCount');
    if (tutoSolution > 0 && tutoMore > 0) {
      return 'have-tutorial';
    }
    if (tutoSolution > 0 || tutoMore > 0) {
      return 'half-tutorial';
    }
    return false;
  }),
  popupBuild: computed('skill.productionTemplate.{spoil,responsive,accessibility1,accessibility2,timer}','skill.{clueStatus,tutoSolutionCount,tutoMoreCount}', 'classTutorial', function () {
    const productionTemplate = this.get('skill.productionTemplate');
    const spoil = this._isNonTested(productionTemplate.get('spoil'));
    const responsive = this._isNonTested(productionTemplate.get('responsive'));
    const blind = this._isNonTested(productionTemplate.get('accessibility1'));
    const colorblind = this._isNonTested(productionTemplate.get('accessibility2'));
    const skillClue = this.get('skill.clueStatus');
    const clue = skillClue?skillClue:'Pas d\'indice';
    const skillTimer = this.get('skill.productionTemplate.timer');
    const timer = skillTimer?`<tr><td>Timer</td><td>${skillTimer} s</td></tr>`:'';
    const classTuto = this.get('classTutorial');
    const tutoSolutionCount = this.get('skill.tutoSolutionCount');
    const tutoMoreCount = this.get('skill.tutoMoreCount');
    const haveTuto = classTuto?`<tr><td>Tuto comprendre </td><td> ${tutoSolutionCount}</td></tr>
                                <tr><td>Tuto en savoir + </td><td> ${tutoMoreCount}</td></tr>`:'';
    return htmlSafe(`<tr><td>Spoil </td><td> ${spoil} </td></tr>
            <tr><td>Responsive </td><td> ${responsive} </td></tr>
            <tr><td>Non/Mal voyant </td><td> ${blind} </td></tr>
            <tr><td>Daltonien </td><td> ${colorblind} </td></tr>
            <tr><td>Indice </td><td> ${clue} </td></tr>
            ${haveTuto}
            ${timer}`);
  }),
  _spoilWeight(spoil) {
    const weight = 5;
    const quality = {
      'Non Sp': 3,
      'Difficilement Sp': 2,
      'Facilement Sp': 1,
      'default': 0
    };
    return (quality[spoil] || quality['default']) / 3 * weight;
  },
  _responsiveWeight(responsive) {
    const weight = 4;
    const quality = {
      'Tablette': 1,
      'Smartphone': 1,
      'Tablette/Smartphone': 2,
      'default': 0
    };
    return (quality[responsive] || quality['default']) / 2 * weight;
  },
  _colorblindWeight(colorblind) {
    const weight = 3;
    const quality = {
      'RAS': 1,
      'OK': 1,
      'default': 0
    };
    return (quality[colorblind] || quality['default']) * weight;
  },
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
  },
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
  },
  _isNonTested(skillDetail) {
    if (skillDetail) {
      return skillDetail;
    }
    return 'Non testé';
  }
});

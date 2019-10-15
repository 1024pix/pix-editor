import Component from '@ember/component';
import {computed} from '@ember/object';

export default Component.extend({
  tagName:'',
  qualityIndication: computed('skill.productionTemplate.{spoil,responsive,accessibility1,accessibility2},skill.clueStatus', function () {

      function spoilWeight(spoil) {
        const weight = 5;
        const quality = {
          'Non Sp': 3,
          'Difficilement Sp': 2,
          'Facilement Sp': 1,
          'default': 0
        };
        return (quality[spoil] || quality['default']) / 3 * weight;
      }

      function responsiveWeight(responsive) {
        const weight = 4;
        const quality = {
          'Tablette': 1,
          'Smartphone': 1,
          'Tablette/Smartphone': 2,
          'default': 0
        };
        return (quality[responsive] || quality['default']) / 2 * weight;
      }

      function colorblindWeight(colorblind) {
        const weight = 3;
        const quality = {
          'RAS': 1,
          'OK': 1,
          'default': 0
        };
        return (quality[colorblind] || quality['default']) * weight;
      }

      function a11YWeight(a11Y) {
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

      function clueWeight(clue) {
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

      const allWeight = 19;
      const spoil = spoilWeight(this.get("skill.productionTemplate.spoil"));
      const responsive = responsiveWeight(this.get("skill.productionTemplate.responsive"));
      const colorblind = colorblindWeight(this.get('skill.productionTemplate.accessibility2'));
      const a11Y = a11YWeight(this.get('skill.productionTemplate.accessibility1'));
      const clue = clueWeight(this.get('skill.clueStatus'));

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
  popupBuild: computed("skill.productionTemplate.{spoil,responsive,accessibility1,accessibility2,timer},skill.{clueStatus,tutoSolutionCount,tutoMoreCount}",
    "classTutorial",
    function () {
      function isNonTested(skillDetail) {
        if (skillDetail) {
          return skillDetail;
        }
        return 'Non testé';
      }

      const spoil = isNonTested(this.get('skill.productionTemplate.spoil'));
      const responsive = isNonTested(this.get('skill.productionTemplate.responsive'));
      const blind = isNonTested(this.get('skill.productionTemplate.accessibility1'));
      const colorblind = isNonTested(this.get('skill.productionTemplate.accessibility2'));
      const clue = () => {
        const skillClue = this.get('skill.clueStatus');
        if (skillClue){
          return skillClue;
        }
        return "Pas d'indice";
      };
      const timer = () =>{
        const skillTimer = this.get('skill.productionTemplate.timer');
        if(skillTimer){
          return `<tr><td>Timer</td><td>${skillTimer} s</td></tr>`;
        }
        return '';
      };


      const haveTuto = ()=>{
        const haveTuto = this.get('classTutorial');
        const tutoSolutionCount = this.get('skill.tutoSolutionCount');
        const tutoMoreCount = this.get('skill.tutoMoreCount');
        if(haveTuto){
          return `<tr><td>Tuto comprendre </td><td> ${tutoSolutionCount}</td></tr>
                  <tr><td>Tuto en savoir + </td><td> ${tutoMoreCount}</td></tr>`;
        }
        return '';
      };
      return `<tr><td>Spoil </td><td> ${spoil} </td></tr>
              <tr><td>Responsive </td><td> ${responsive} </td></tr>
              <tr><td>Non/Mal voyant </td><td> ${blind} </td></tr>
              <tr><td>Daltonien </td><td> ${colorblind} </td></tr>
              <tr><td>Indice </td><td> ${clue()} </td></tr>
              ${haveTuto()}
              ${timer()}`;
    }
  )
});

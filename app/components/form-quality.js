import classic from 'ember-classic-decorator';
import Component from '@ember/component';

@classic
export default class FormQuality extends Component {
  init() {
    super.init(...arguments);
    this.options = {
      'accessibility1':["RAS","OK", "Acquis Non Pertinent", "KO", "A tester"],
      'accessibility2':["RAS","OK","KO"],
      'responsive':["Tablette", "Smartphone", "Tablette/Smartphone", "Non"],
      'spoil':["Non Sp", "Difficilement Sp", "Facilement Sp"]
    }
  }
}

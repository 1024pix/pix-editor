import Component from '@glimmer/component';


export default class Quality extends Component {
  options = {
    'accessibility1':['RAS','OK', 'Acquis Non Pertinent', 'KO', 'A tester'],
    'accessibility2':['RAS','OK','KO'],
    'responsive':['Tablette', 'Smartphone', 'Tablette/Smartphone', 'Non'],
    'spoil':['Non Sp', 'Difficilement Sp', 'Facilement Sp']
  }
}

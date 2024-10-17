import Component from '@glimmer/component';

export default class Quality extends Component {
  accessibility1Options = [
    { value: 'RAS', label: 'RAS' },
    { value: 'OK', label: 'OK' },
    { value: 'Acquis Non Pertinent', label: 'Acquis Non Pertinent' },
    { value: 'KO', label: 'KO' },
    { value: 'A tester', label: 'A tester' },
  ];
  accessibility2Options = [
    { value: 'RAS', label: 'RAS' },
    { value: 'OK', label: 'OK' },
    { value: 'KO', label: 'KO' },
  ];
  responsiveOptions = [
    { value: 'Tablette', label: 'Tablette' },
    { value: 'Smartphone', label: 'Smartphone' },
    { value: 'Tablette/Smartphone', label: 'Tablette/Smartphone' },
    { value: 'Non', label: 'Non' },
  ];
  spoilOptions = [
    { value: 'Non Sp', label: 'Non Sp' },
    { value: 'Difficilement Sp', label: 'Difficilement Sp' },
    { value: 'Facilement Sp', label: 'Facilement Sp' },
  ];
  deafAndHardOfHearingOptions = [
    { value: 'RAS', label: 'RAS' },
    { value: 'OK', label: 'OK' },
    { value: 'KO', label: 'KO' },
  ];
}

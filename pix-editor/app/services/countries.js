import Service from '@ember/service';
import { countries } from 'countries-list';

const NAME_LOCALE = 'fr';

const dn = new Intl.DisplayNames([NAME_LOCALE], { type: 'region' });

const standardCountries = Object.keys(countries).map((code) => ({
  code,
  name: dn.of(code),
}));

const nonStandardCountries = [
  { code: 'CG', name: 'Congo' },
  { code: 'US', name: 'USA' },
  { code: 'GB', name: 'UK' },
  { code: 'KM', name: 'Comores' },
  { code: 'MM', name: 'Birmanie' },
  { code: 'GW', name: 'Guinée-Bissao' },
  { code: 'PS', name: 'Palestine' },
  { code: 'VC', name: 'Saint-Vincent-et-les-Grenadines' },
  { code: 'SB', name: 'Salomon' },
  { code: 'VA', name: 'Vatican' },
  { code: 'AA', name: 'Neutre' },
];

export default class CountriesService extends Service {
  get list() {
    const countryList = [...standardCountries, ...nonStandardCountries];

    return countryList.sort((a, b) => a.name.localeCompare(b.name));
  }
}

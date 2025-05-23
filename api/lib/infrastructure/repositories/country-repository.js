import { countries } from 'countries-list';
import { Country } from '../../domain/models/Country.js';

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
  { code: 'KM', name: 'Les Comores' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MM', name: 'Birmanie' },
  { code: 'GW', name: 'Guinée-Bissao' },
  { code: 'PS', name: 'La Palestine' },
  { code: 'VC', name: 'Saint-Vincent-et-les-Grenadines' },
  { code: 'SB', name: 'Salomon' },
  { code: 'VA', name: 'Vatican' },
];

export function list() {
  const countries = [...standardCountries, ...nonStandardCountries];

  return countries.map((country) => toDomain(country));
};

function toDomain({ code, name }) {
  return new Country({ code, name });
}

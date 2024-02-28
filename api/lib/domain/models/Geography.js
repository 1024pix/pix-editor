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
  { code: 'KM', name: 'Les Comores' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'MM', name: 'Birmanie' },
  { code: 'GW', name: 'Guinée-Bissao' },
  { code: 'PS', name: 'La Palestine' },
  { code: 'VC', name: 'Saint-Vincent-et-les-Grenadines' },
  { code: 'SB', name: 'Salomon' },
  { code: 'VA', name: 'Vatican' },
];

export function getCountryCode(name) {
  const standardCountry = findByNameComparison(standardCountries, name);
  if (standardCountry) return standardCountry.code;

  const nonStandardCountry = findByNameComparison(nonStandardCountries, name);
  return nonStandardCountry?.code;
}

const collator = new Intl.Collator(NAME_LOCALE, {
  sensitivity: 'base',
  usage: 'search',
});

function findByNameComparison(countries, name) {
  return countries.find((country) => collator.compare(country.name, name) === 0);
}

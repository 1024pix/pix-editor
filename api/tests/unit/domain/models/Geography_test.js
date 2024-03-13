import { describe, expect, it } from 'vitest';
import { getCountryCode, getCountryName } from '../../../../lib/domain/models/Geography';

describe('Unit | Model | Geography', () => {
  describe('#getCountryCode', () => {
    it('should return country code for standard french names', () => {
      // given
      const names = [
        'France',
        'Pays-Bas',
        'Allemagne',
        'belize',
        'cote d\'ivoire',
      ];

      // when
      const codes = names.map(getCountryCode);

      // then
      expect(codes).toEqual(['FR', 'NL', 'DE', 'BZ', 'CI']);
    });

    it('should return country code for all frontend country names', () => {
      // given
      const names = [
        'Afghanistan',
        'Afrique du Sud',
        'Albanie',
        'Algérie',
        'Allemagne',
        'Andorre',
        'Angola',
        'Antigua-et-Barbuda',
        'Arabie saoudite',
        'Argentine',
        'Arménie',
        'Australie',
        'Autriche',
        'Azerbaïdjan',
        'Bahamas',
        'Bahreïn',
        'Bangladesh',
        'Barbade',
        'Belgique',
        'Belize',
        'Bénin',
        'Bhoutan',
        'Biélorussie',
        'Birmanie',
        'Bolivie',
        'Bosnie-Herzégovine',
        'Botswana',
        'Brésil',
        'Brunei',
        'Bulgarie',
        'Burkina Faso',
        'Burundi',
        'Cambodge',
        'Cameroun',
        'Canada',
        'Cap-Vert',
        'Chili',
        'Chine',
        'Chypre',
        'Colombie',
        'Les Comores',
        'Congo',
        'Îles Cook',
        'Corée du Nord',
        'Corée du Sud',
        'Costa Rica',
        'Côte d\'ivoire',
        'Croatie',
        'Cuba',
        'Danemark',
        'Djibouti',
        'République dominicaine',
        'Dominique',
        'Égypte',
        'Émirats arabes unis',
        'Équateur',
        'Érythrée',
        'Espagne',
        'Estonie',
        'Eswatini',
        'Éthiopie',
        'Fidji',
        'Finlande',
        'France',
        'Gabon',
        'Gambie',
        'Géorgie',
        'Ghana',
        'Grèce',
        'Grenade',
        'Guinée',
        'Guatémala',
        'Guinée équatoriale',
        'Guinée-Bissao',
        'Guyana',
        'Haïti',
        'Honduras',
        'Hongrie',
        'Inde',
        'Indonésie',
        'Irak',
        'Iran',
        'Irlande',
        'Islande',
        'Israël',
        'Italie',
        'Jamaïque',
        'Japon',
        'Jordanie',
        'Kazakhstan',
        'Kenya',
        'Kirghizstan',
        'Kiribati',
        'Kosovo',
        'Koweït',
        'Laos',
        'Lésotho',
        'Lettonie',
        'Liban',
        'Libéria',
        'Libye',
        'Liechtenstein',
        'Lituanie',
        'Luxembourg',
        'Macédoine du Nord',
        'Madagascar',
        'Malaisie',
        'Malawi',
        'Maldives',
        'Mali',
        'Malte',
        'Maroc',
        'Îles Marshall',
        'Maurice',
        'Mauritanie',
        'Mexique',
        'Micronésie',
        'Moldavie',
        'Monaco',
        'Mongolie',
        'Monténégro',
        'Mozambique',
        'Namibie',
        'Nauru',
        'Népal',
        'Nicaragua',
        'Niger',
        'Nigéria',
        'Niue',
        'Norvège',
        'Nouvelle-Zélande',
        'Oman',
        'Ouganda',
        'Ouzbékistan',
        'Pakistan',
        'Palaos',
        'La Palestine',
        'Panama',
        'Papouasie-Nouvelle-Guinée',
        'Paraguay',
        'Pays-Bas',
        'Pérou',
        'Philippines',
        'Pologne',
        'Portugal',
        'Qatar',
        'République centrafricaine',
        'Roumanie',
        'Russie',
        'Rwanda',
        'Saint-Christophe-et-Niévès',
        'Sainte-Lucie',
        'Saint-Marin',
        'Saint-Vincent-et-les-Grenadines',
        'Salomon',
        'Salvador',
        'Samoa',
        'Sao Tomé-et-Principe',
        'Sénégal',
        'Serbie',
        'Sierra Leone',
        'Singapour',
        'Slovaquie',
        'Slovénie',
        'Somalie',
        'Soudan',
        'Soudan du Sud',
        'Sri Lanka',
        'Suède',
        'Suisse',
        'Suriname',
        'Syrie',
        'Tadjikistan',
        'Tanzanie',
        'Tchad',
        'Tchéquie',
        'Thaïlande',
        'Timor oriental',
        'Togo',
        'Tonga',
        'Trinité-et-Tobago',
        'Tunisie',
        'Turkménistan',
        'Turquie',
        'Tuvalu',
        'UK',
        'Ukraine',
        'Uruguay',
        'USA',
        'Vanuatu',
        'Vatican',
        'Vénézuéla',
        'Vietnam',
        'Yémen',
        'Zambie',
        'Zimbabwé',
      ];

      // when
      const codes = names.map(getCountryCode);

      // then
      expect(codes, `no country code for ${names[codes.indexOf(undefined)]}`).not.toContain(undefined);
    });

    it('should return null for other names', () => {
      // given
      const names = [
        'Neutre',
        'Institutions internationales',
        null,
        undefined,
        'La République de Gilead',
      ];

      // when
      const codes = names.map(getCountryCode);

      // then
      expect(codes).toEqual([
        null,
        null,
        null,
        null,
        null,
      ]);
    });
  });
  describe('#getCountryName', () => {
    it('should convert country code to country french name', () => {
      // given
      const codes = [
        'af', 'ZA', 'AL', 'DZ', 'DE', 'AD',
        'AO', 'AG', 'SA', 'AR', 'AM', 'AU',
        'AT', 'AZ', 'BS', 'BH', 'BD', 'BB',
        'BE', 'BZ', 'BJ', 'BT', 'BY', 'MM',
        'BO', 'BA', 'BW', 'BR', 'BN', 'BG',
        'BF', 'BI', 'KH', 'CM', 'CA', 'CV',
        'CL', 'CN', 'CY', 'CO', 'KM', 'CG',
        'CK', 'KP', 'KR', 'CR', 'CI', 'HR',
        'CU', 'DK',
        'DJ', 'DO', 'DM', 'EG', 'AE', 'EC',
        'ER', 'ES', 'EE', 'SZ', 'ET', 'FJ',
        'FI', 'FR', 'GA', 'GM', 'GE', 'GH',
        'GR', 'GD', 'GN', 'GT', 'GQ', 'GW',
        'GY', 'HT', 'HN', 'HU', 'IN', 'ID',
        'IQ', 'IR', 'IE', 'IS', 'IL', 'IT',
        'JM', 'JP', 'JO', 'KZ', 'KE', 'KG',
        'KI', 'XK', 'KW', 'LA', 'LS', 'LV',
        'LB', 'LR',
        'LY', 'LI', 'LT', 'LU', 'MK', 'MG',
        'MY', 'MW', 'MV', 'ML', 'MT', 'MA',
        'MH', 'MU', 'MR', 'MX', 'FM', 'MD',
        'MC', 'MN', 'ME', 'MZ', 'NA', 'NR',
        'NP', 'NI', 'NE', 'NG', 'NU', 'NO',
        'NZ', 'OM', 'UG', 'UZ', 'PK', 'PW',
        'PS', 'PA', 'PG', 'PY', 'NL', 'PE',
        'PH', 'PL', 'PT', 'QA', 'CF', 'RO',
        'RU', 'RW',
        'KN', 'LC', 'SM', 'VC', 'SB', 'SV',
        'WS', 'ST', 'SN', 'RS', 'SL', 'SG',
        'SK', 'SI', 'SO', 'SD', 'SS', 'LK',
        'SE', 'CH', 'SR', 'SY', 'TJ', 'TZ',
        'TD', 'CZ', 'TH', 'TL', 'TG', 'TO',
        'TT', 'TN', 'TM', 'TR', 'TV', 'GB',
        'UA', 'UY', 'US', 'VU', 'VA', 'VE',
        'VN', 'YE', 'ZM', 'ZW',
      ];

      // when
      const names = codes.map(getCountryName);

      // then
      expect(names, `no country name for ${codes[names.indexOf(undefined)]}`).not.toContain(undefined);
    });

    it('should return \'Neutre\' for unknown country code', () => {
      // given
      const codes = [ null, 'UKNOWN', undefined ];

      // when
      const names = codes.map(getCountryName);

      // then
      expect(names).toEqual([
        'Neutre',
        'Neutre',
        'Neutre',
      ]);
    });
  });
});

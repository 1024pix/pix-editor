const AirtableRecord = require('airtable').Record;

module.exports = function challengeRawAirTableFixture({ id, fields } = { id: 'recwWzTquPlvIl4So', fields: { } }) {
  return new AirtableRecord('Epreuves', id, {
    id,
    'fields': Object.assign({
      'id persistant': id,
      'Consigne': 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
      'Propositions': '- 1\n- 2\n- 3\n- 4\n- 5',
      'Type d\'épreuve': 'QCM',
      'Tests': [
        'rec8JuSJXIaGEb87M',
        'recSaR2WAYZdGQpTx',
        'recrRaLs10oBNGZ86',
        'recBoha6fgjOcmX1N',
        'reccPO6AYavta2Kpa',
        'recYQS5fiiRqmKBDP',
        'recMjdIGpEIDaKB8u',
        'rec4qvsIuGj5FN5Ej',
        'recP3QJ6PtAOQ5VAq',
        'rec32nWxGA03Ygplx',
        'recNPB7dTNt5krlMA',
        'rece0Id3wMXgTjJeE',
        'rec0pJodmLlAvtU7q',
        'recyaN7FCESzSsVXL',
      ],
      '_Preview Temp': 'https://docs.google.com/presentation/d/12lnGYXethPtmGkjP_DymgW1lINs2XyFi4jQRbZy_cpo/edit#slide=id.g16ce321c21_0_0',
      '_Statut': 'validé (beta)',
      'Bonnes réponses': '1, 5',
      'Bonnes réponses à afficher': '1, 5',
      '_Niveau': [
        '3',
      ],
      'Type péda': 'q-situation',
      'Auteur': [
        'SPS',
      ],
      'Timer': 1234,
      'Licence image': 'écran libre',
      'Déclinable': 'facilement',
      'Internet et outils': 'Oui',
      'Accessibilité': 'Non',
      'T1 - Espaces, casse & accents': 'Activé',
      'T2 - Ponctuation': 'Désactivé',
      'T3 - Distance d\'édition': 'Activé',
      'competences': [
        'recsvLz0W2ShyfD63',
      ],
      'Généalogie': 'Prototype 1',
      'Statut': 'validé',
      'Scoring': '1: @outilsTexte2\n2: @outilsTexte4',
      'Embed URL': 'https://github.io/page/epreuve.html',
      'Embed title': 'Epreuve de selection de dossier',
      'Embed height': 500,
      'Acquix (id persistant)': [
        'recUDrCWD76fp5MsE',
      ],
      'acquis': [
        '@modèleEco3',
      ],
      'Preview': 'http://staging.pix.fr/challenges/recwWzTquPlvIl4So/preview',
      'Record ID': 'recwWzTquPlvIl4So',
      'domaines': [
        'recvoGdo7z2z7pXWa',
      ],
      'Tubes': [
        'reccqGUKgzIOK8f9U',
      ],
      'Compétences (via tube) (id persistant)': [
        'recsvLz0W2ShyfD63',
      ],
      'Format': 'petit',
      'Langues': [
        'Francophone',
      ],
    }, fields),
    'createdTime': '2016-08-24T11:59:02.000Z',
  });
};

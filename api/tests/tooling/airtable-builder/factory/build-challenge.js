const buildChallenge = function buildChallenge({
  id,
  instruction,
  proposals,
  type,
  solution,
  solutionToDisplay,
  t1Status,
  t2Status,
  t3Status,
  status,
  skillId,
  embedUrl,
  embedTitle,
  embedHeight,
  timer,
  competenceId,
  format,
  files,
  autoReply,
  locales,
  alternativeInstruction,
  airtableId,
  skills,
  genealogy,
  pedagogy,
  author,
  declinable,
  preview,
  version,
  alternativeVersion,
  accessibility1,
  accessibility2,
  spoil,
  responsive,
  area,
  focusable,
  delta,
  alpha,
  updatedAt,
  validatedAt,
}) {
  return {
    id: airtableId,
    'fields': {
      'id persistant': id,
      'Consigne': instruction,
      'Propositions': proposals,
      'Type d\'épreuve': type,
      'Bonnes réponses': solution,
      'Bonnes réponses à afficher': solutionToDisplay,
      'Timer': timer,
      'T1 - Espaces, casse & accents': _convertStatusFromBoolToString(t1Status),
      'T2 - Ponctuation': _convertStatusFromBoolToString(t2Status),
      'T3 - Distance d\'édition': _convertStatusFromBoolToString(t3Status),
      'Statut': status,
      'Embed URL': embedUrl,
      'Embed title': embedTitle,
      'Embed height': embedHeight,
      'Acquix (id persistant)': [skillId],
      'Format': format,
      'files': files,
      'Langues': _convertLocalesToLanguages(locales || []),
      'Réponse automatique': autoReply,
      'Consigne alternative': alternativeInstruction,
      'Compétences (via tube) (id persistant)': [competenceId],
      'Record ID': airtableId,
      'Acquix': skills,
      'Généalogie': genealogy,
      'Type péda': pedagogy,
      'Auteur': author,
      'Déclinable': declinable,
      'Preview': preview,
      'Version prototype': version,
      'Version déclinaison': alternativeVersion,
      'Non voyant': accessibility1,
      'Daltonien': accessibility2,
      'Spoil': spoil,
      'Responsive': responsive,
      'Géographie': area,
      'Focalisée': focusable,
      'Difficulté calculée': delta ? delta.toString() : '',
      'Discrimination calculée': alpha ? alpha.toString() : '',
      'updated_at': updatedAt,
      'validated_at': validatedAt,
    },
  };
};

function _convertStatusFromBoolToString(status) {
  return status ? 'Activé' : 'Désactivé';
}

function _convertLocalesToLanguages(locales) {
  return locales.map((locale) => {
    if (locale === 'fr') {
      return 'Francophone';
    }
    if (locale === 'fr-fr') {
      return 'Franco Français';
    }
    if (locale === 'en') {
      return 'Anglais';
    }
  });
}

module.exports = buildChallenge;

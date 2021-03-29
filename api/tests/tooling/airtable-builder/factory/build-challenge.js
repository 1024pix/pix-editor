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
  scoring,
  status,
  skillIds,
  skills,
  embedUrl,
  embedTitle,
  embedHeight,
  timer,
  competenceId,
  format,
  autoReply,
  locales,
  alternativeInstruction,
}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Consigne': instruction,
      'Propositions': proposals,
      'Type d\'épreuve': type,
      'Bonnes réponses': solution,
      'Bonnes réponses à afficher': solutionToDisplay,
      'Timer': timer,
      'T1 - Espaces, casse & accents': t1Status,
      'T2 - Ponctuation': t2Status,
      'T3 - Distance d\'édition': t3Status,
      'Statut': status,
      'Scoring': scoring,
      'Embed URL': embedUrl,
      'Embed title': embedTitle,
      'Embed height': embedHeight,
      'Acquix (id persistant)': skillIds,
      'acquis': skills,
      'Format': format,
      'Langues': _convertLocalesToLanguages(locales || []),
      'Réponse automatique': autoReply,
      'Consigne alternative': alternativeInstruction,
      'Compétences (via tube) (id persistant)': [competenceId],
    },
  };
};

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

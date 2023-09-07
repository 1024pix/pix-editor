const ChallengeForRelease = require('../../../../lib/domain/models/release/ChallengeForRelease');

module.exports = function buildChallengeForRelease({
  id = 'recwWzTquPlvIl4So',
  instruction = 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
  alternativeInstruction = '',
  proposals = '- 1\n- 2\n- 3\n- 4\n- 5',
  type = 'QCM',
  solution = '1, 5',
  solutionToDisplay = '1',
  t1Status = 'Activé',
  t2Status = 'Désactivé',
  t3Status = 'Activé',
  status = 'validé',
  skillId = 'brecUDrCWD76fp5MsE',
  timer = 1234,
  competenceId = 'recsvLz0W2ShyfD63',
  embedUrl = 'https://github.io/page/epreuve.html',
  embedTitle = 'Epreuve de selection de dossier',
  embedHeight = 500,
  format = 'mots',
  autoReply = false,
  locales = [],
  focusable = false,
  delta = 0.2,
  alpha = 0.5,
  responsive = 'Smartphone',
  genealogy = 'Prototype 1',
  attachments,
  illustrationAlt = 'alt illu',
  illustrationUrl = 'url illu',
  shuffled = false,
  alternativeVersion = 2
} = {}) {

  return new ChallengeForRelease({
    id,
    instruction,
    alternativeInstruction,
    proposals,
    type,
    solution,
    solutionToDisplay,
    t1Status,
    t2Status,
    t3Status,
    status,
    skillId,
    timer,
    competenceId,
    embedUrl,
    embedTitle,
    embedHeight,
    format,
    autoReply,
    locales,
    focusable,
    delta,
    alpha,
    responsive,
    genealogy,
    attachments,
    illustrationAlt,
    illustrationUrl,
    shuffled,
    alternativeVersion
  });
};

import _ from 'lodash';
import { Challenge } from '../../../../lib/domain/models/index.js';

export function buildChallenge({
  id = 'persistant id',
  instruction = 'Les moteurs de recherche affichent certains liens en raison d\'un accord commercial.\n\nDans quels encadrés se trouvent ces liens ?',
  alternativeInstruction = '',
  proposals = '- 1\n- 2\n- 3\n- 4\n- 5',
  type = 'QCM',
  solution = '1, 5',
  solutionToDisplay = '1',
  t1Status = true,
  t2Status = false,
  t3Status = true,
  status = 'validé',
  timer = 1234,
  competenceId = 'recsvLz0W2ShyfD63',
  embedUrl = 'https://github.io/page/epreuve.html',
  embedTitle = 'Epreuve de selection de dossier',
  embedHeight = 500,
  format = 'mots',
  autoReply = false,
  locales = ['fr'],
  focusable = false,
  skills = ['recordId generated by Airtable'],
  genealogy = 'Prototype 1',
  pedagogy = 'q-situation',
  author = ['SPS'],
  declinable = 'facilement',
  version = 1,
  alternativeVersion = 2,
  accessibility1 = 'OK',
  accessibility2 = 'RAS',
  spoil = 'Non Sp',
  responsive = 'non',
  area = 'France',
  files = ['attachment recordId generated by Airtable'],
  airtableId = 'airtable id',
  updatedAt = '2021-10-04',
  createdAt = '1986-07-14',
  validatedAt = '2023-02-02T14:17:30.820Z',
  archivedAt = '2023-03-03T10:47:05.555Z',
  madeObsoleteAt = '2023-04-04T10:47:05.555Z',
  shuffled = false,
  contextualizedFields = ['instruction', 'illustration'],
  skillId = 'recSkillId',
  alpha = 0.5,
  delta = 0.2,
  translations = {
    [Challenge.getPrimaryLocale(locales)]: {
      instruction,
      alternativeInstruction,
      proposals,
      solution,
      solutionToDisplay,
      embedTitle,
    },
  },
  localizedChallenges = [{
    id,
    challengeId: id,
    locale: Challenge.getPrimaryLocale(locales),
    embedUrl,
    status: null,
  }],
} = {}, fieldsToOmit = []) {
  const data = {
    id,
    type,
    t1Status,
    t2Status,
    t3Status,
    status,
    skills,
    embedHeight,
    timer,
    competenceId,
    format,
    files,
    autoReply,
    locales,
    focusable,
    airtableId,
    genealogy,
    pedagogy,
    author,
    declinable,
    version,
    alternativeVersion,
    accessibility1,
    accessibility2,
    spoil,
    responsive,
    area,
    updatedAt,
    validatedAt,
    archivedAt,
    madeObsoleteAt,
    createdAt,
    shuffled,
    contextualizedFields,
    translations,
    skillId,
    alpha,
    delta,
    localizedChallenges,
  };
  return new Challenge(_.omit(data, fieldsToOmit));
}

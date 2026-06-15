import { databaseBuffer } from '../database-buffer.js';

/**
 * @param {{
 *   id: string
 *   type?: string
 *   t1Status?: boolean
 *   t2Status?: boolean
 *   t3Status?: boolean
 *   status?: string
 *   skillId?: string
 *   embedHeight?: number
 *   timer?: number
 *   format?: string
 *   autoReply?: boolean
 *   locales?: string[]
 *   focusable?: boolean
 *   genealogy?: string
 *   pedagogy?: string
 *   author?: string[]
 *   declinable?: string
 *   version?: number
 *   alternativeVersion?: number
 *   accessibility1?: string
 *   accessibility2?: string
 *   spoil?: string
 *   responsive?: string
 *   delta?: number
 *   alpha?: number
 *   shuffled?: boolean
 *   contextualizedField: string[]
 *   assessmentMaintenanceTags?: string[]
 *   translationMaintenanceTags?: string[]
 *   validatedAt?: string | number | Date
 *   archivedAt?: string | number | Date
 *   createdAt?: string | number | Date
 *   madeObsoleteAt: string | number | Date
 *   updatedAt?: string | number | Date
 * }} challengeToBuild
 */
export function buildChallenge({
  id,
  type,
  t1Status,
  t2Status,
  t3Status,
  status,
  skillId,
  embedHeight,
  timer,
  format,
  autoReply,
  locales,
  focusable,
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
  shuffled,
  createdAt,
  updatedAt,
  validatedAt,
  archivedAt,
  madeObsoleteAt,
  isQualityOk,
  assessmentMaintenanceTags,
  translationMaintenanceTags,
} = {}) {
  return databaseBuffer.pushInsertable({
    tableName: 'challenges',
    values: {
      id,
      type,
      t1Status,
      t2Status,
      t3Status,
      status,
      skillId,
      embedHeight,
      timer,
      format,
      autoReply,
      locales,
      focusable,
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
      shuffled,
      createdAt,
      updatedAt,
      validatedAt,
      archivedAt,
      madeObsoleteAt,
      isQualityOk,
      assessmentMaintenanceTags,
      translationMaintenanceTags,
    },
  });
}

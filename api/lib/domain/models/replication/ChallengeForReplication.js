/**
 * @typedef {import('../index.js').Challenge} Challenge
 */

export class ChallengeForReplication {
  /**
   * @param {Challenge} challenge
   */
  constructor(challenge) {
    this.id = challenge.id;
    this.instruction = challenge.instruction;
    this.status = challenge.status;
    this.type = challenge.type;
    this.timer = challenge.timer;
    this.autoReply = challenge.autoReply;
    this.skillId = challenge.skillId;
    this.embedUrl = challenge.embedUrl;
    this.embedTitle = challenge.embedTitle;
    this.alternativeInstruction = challenge.alternativeInstruction;
    this.createdAt = challenge.createdAt;
    this.validatedAt = challenge.validatedAt;
    this.archivedAt = challenge.archivedAt;
    this.madeObsoleteAt = challenge.madeObsoleteAt;
    this.accessibility1 = challenge.accessibility1;
    this.accessibility2 = challenge.accessibility2;
    this.spoil = challenge.spoil;
    this.responsive = challenge.responsive;
    this.deafAndHardOfHearing = challenge.deafAndHardOfHearing;
    this.requireGafamWebsiteAccess = challenge.requireGafamWebsiteAccess;
    this.isIncompatibleIpadCertif = challenge.isIncompatibleIpadCertif;
    this.toRephrase = challenge.toRephrase;
    this.isAwarenessChallenge = challenge.isAwarenessChallenge;
    this.isQualityOk = challenge.isQualityOk;
    this.genealogy = challenge.genealogy;
    this.version = challenge.version;
    this.alternativeVersion = challenge.alternativeVersion;
    this.declinable = challenge.declinable;
    this.proposals = challenge.proposals;
    this.solution = challenge.solution;
    this.pedagogy = challenge.pedagogy;
    this.urlsToConsult = challenge.urlsToConsult;
    this.format = challenge.format;
    this.assessmentMaintenanceTags = challenge.assessmentMaintenanceTags;
    this.translationMaintenanceTags = challenge.translationMaintenanceTags;
    this.locales = challenge.locales;
    this.embedUrl = challenge.embedUrl;
    this.geography = challenge.geography;
    this.focusable = challenge.focusable;
    this.solutionToDisplay = challenge.solutionToDisplay;
    this.shuffled = challenge.shuffled;

    // mappings for replication
    this.skillIds = [challenge.skillId];
    this.skillCount = 1;
    this.firstSkillId = challenge.skillId;
    this.secondSkillId = undefined;
    this.thirdSkillId = undefined;
    this.languages = challenge.locales;
    this.hasEmbedUrl = !!challenge.embedUrl;
    this.hasAlternativeInstruction = !!challenge.alternativeInstruction;
    this.area = challenge.geography;
    this.focus = !!challenge.focusable;
    this.explicativeResponse = challenge.solutionToDisplay;
    this.shuffled = !!challenge.shuffled;
  }
}

module.exports = class ChangelogEntryFactory {
  static get categories() {
    return {
      challenge: 'épreuve',
    };
  }

  static get defaultMessages() {
    return {
      challengePrototypeValidation: 'Mise en production du prototype',
      challengeAlternativeValidation: 'Mise en production de la déclinaison',
    };
  }

  static forChallengePrototypeValidation({ challengeId, author, changelog }) {
    return {
      text: changelog?.length > 0 ? changelog : ChangelogEntryFactory.defaultMessages.challengePrototypeValidation,
      recordId: challengeId,
      author,
      createdAt: (new Date()).toISOString(),
      elementType: ChangelogEntryFactory.categories.challenge,
    };
  }

  static forChallengeAlternativeValidation({ challengeId, author, changelog }) {
    return {
      text: changelog?.length > 0 ? changelog : ChangelogEntryFactory.defaultMessages.challengeAlternativeValidation,
      recordId: challengeId,
      author,
      createdAt: (new Date()).toISOString(),
      elementType: ChangelogEntryFactory.categories.challenge,
    };
  }
};

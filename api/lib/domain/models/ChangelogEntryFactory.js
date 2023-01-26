module.exports = class ChangelogEntryFactory {
  static get categories() {
    return {
      challenge: 'épreuve',
    };
  }

  static forChallengeValidation({ challengeId, author, changelog }) {
    return {
      text: changelog, // TODO : should handle alter or proto default message ?
      recordId: challengeId,
      author,
      createdAt: (new Date()).toISOString(),
      elementType: ChangelogEntryFactory.categories.challenge,
    };
  }
};

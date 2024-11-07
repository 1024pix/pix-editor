export class WhitelistedUrl {
  static get CHECK_TYPES() {
    return {
      EXACT_MATCH: 'exact_match',
      STARTS_WITH: 'starts_with',
    };
  }
}

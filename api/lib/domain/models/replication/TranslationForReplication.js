export class TranslationForReplication {
  constructor({ id, key, locale, value, model, entityId, sourceEntityId }) {
    this.id = id;
    this.locale = locale;
    this.value = value;
    this.model = model;
    this.entityId = entityId;
    this.sourceEntityId = sourceEntityId;

    // mappings for replication
    this.key = extractTranslationsKey(key);
  }
}

function extractTranslationsKey(key) {
  const [
    model,
    id,
    field,
  ] = key.split('.');

  if (model !== 'challenge' || field !== 'solutionToDisplay') {
    return key;
  }
  return `${model}.${id}.explicativeResponse`;
}

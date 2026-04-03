export class TranslationForReplication {
  constructor({ id, key, locale, value, model, entityId, sourceEntityId }) {
    this.id = id;
    this.key = key;
    this.locale = locale;
    this.value = value;
    this.model = model;
    this.entityId = entityId;
    this.sourceEntityId = sourceEntityId;
  }
}

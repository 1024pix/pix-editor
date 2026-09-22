export default class BaseRepository {
  static getAuthHeaders() {
    const emberSimpleAuthSession = JSON.parse(window.localStorage.getItem('ember_simple_auth-session'));
    const apiKey = emberSimpleAuthSession.authenticated.apiKey;
    return {
      'X-Api-Key': apiKey,
    };
  }

  static deserialize(entity) {
    const baseEntity = {
      id: entity.id,
      ...entity.attributes,
    };

    if (entity.relationships) {
      for (const [relationshipName, relationshipContent] of Object.entries(entity.relationships)) {
        if (Array.isArray(relationshipContent.data)) {
          const propertyName = `${relationshipName}Ids`;
          baseEntity[propertyName] = relationshipContent.data.map((r) => r.id);
        } else {
          const propertyName = `${relationshipName}Id`;
          baseEntity[propertyName] = relationshipContent.data.id;
        }
      }
    }

    return baseEntity;
  }
}

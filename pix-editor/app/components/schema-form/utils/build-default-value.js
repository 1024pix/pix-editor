/**
 * Construit une valeur par défaut à partir d'un JSON schema.
 *
 * Utilisé par ArrayField lors de l'ajout d'un nouvel item.
 * Pour les oneOf, prend la première variante comme défaut.
 */
export function buildDefaultValue(schema) {
  if (!schema) return null;

  // Utiliser le défaut explicite du schema s'il existe
  if (schema.default !== undefined) return schema.default;

  // Pour les oneOf, prendre la première variante
  if (schema.oneOf?.length > 0) {
    return buildDefaultValue(schema.oneOf[0]);
  }

  switch (schema.type) {
    case 'object': {
      const value = {};
      for (const [key, propSchema] of Object.entries(schema.properties ?? {})) {
        // N'initialiser que les champs requis pour rester minimal
        if (schema.required?.includes(key)) {
          value[key] = buildDefaultValue(propSchema);
        }
      }
      return value;
    }

    case 'array':
      return [];

    case 'string':
      // Pour les enums, prendre la première valeur autorisée
      return schema.enum?.[0] ?? '';

    case 'number':
    case 'integer':
      return schema.minimum ?? 0;

    case 'boolean':
      return false;

    default:
      return null;
  }
}

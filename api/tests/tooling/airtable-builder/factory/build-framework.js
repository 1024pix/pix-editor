const buildFramework = function buildFramework({
  id,
  name,
} = {}) {
  return {
    id,
    'fields': {
      'Nom': name,
    },
  };
};

module.exports = buildFramework;

module.exports = function buildCourse({
  id,
  name,
  description,
  competences,
  challenges,
  imageUrl,
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': name,
      'Description': description,
      'Image': [{ url: imageUrl }],
      'Épreuves (id persistant)': challenges,
      'Competence (id persistant)': competences,
    },
  };
};

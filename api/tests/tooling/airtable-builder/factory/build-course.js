module.exports = function buildCourse({
  id,
  name,
  description,
  competences,
  challenges,
  imageUrl,
  adaptive,
  createdAt = new Date('2021-01-01')
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
      'Adaptatif ?': adaptive,
      'created_at': createdAt.toISOString(),
    },
  };
};

module.exports = function buildTube({
  id = 'recTIddrkopID23Fp',
  nom = '@Moteur',
  titre = 'Moteur de recherche',
  description = 'Connaître le fonctionnement d\'un moteur de recherche',
  titrePratique = 'Outils d\'accès au web',
  descriptionPratique = 'Identifier un navigateur web et un moteur de recherche, connaître le fonctionnement du moteur de recherche',
  createdTime = '2018-03-15T14:35:03.000Z',
} = {}) {

  return {
    id,
    'fields': {
      'id persistant': id,
      'Nom': nom,
      'Titre': titre,
      'Description': description,
      'Titre pratique': titrePratique,
      'Description pratique': descriptionPratique,
    },
    'createdTime': createdTime,
  };
};

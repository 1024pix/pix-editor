const buildArea = require('./build-area');
const buildCompetence = require('./build-competence');

module.exports = function buildRelease() {
  const area = buildArea({
    code: '1',
    color: 'jaffa',
    id: 'recvoGdo7z2z7pXWa',
    name: '1. Information et données',
    title: 'Information et données'
  });

  const competence = buildCompetence({
    id: 'recsvLz0W2ShyfD63',
    name: 'Mener une recherche et une veille d’information',
    index:  '1.1',
    description: '1.1 Mener une recherche et une veille d’information',
    skills: [],
    area: {
      code: '1',
      color: 'jaffa',
      id: 'recvoGdo7z2z7pXWa',
      title: 'Information et données'
    }
  });
  area.competences = [competence];

  return {
    areas: [area],
    competences: [competence]
  };
};

export default function(server) {
  const competenceIds = [
    'recCompetence1.1',
    'recCompetence2.1',
  ];

  server.create('config', 'default');
  const apiKey = 'valid-api-key';
  localStorage.setItem('pix-api-key', apiKey);
  server.create('user', { apiKey, trigram: 'ABC' });

  competenceIds.map((competenceId) => server.create('competence', { id: competenceId, pixId: `pixId ${competenceId}`, tubeIds: ['recTube1'] }));
  server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
  server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });

}

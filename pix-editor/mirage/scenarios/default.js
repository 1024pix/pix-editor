export default function(server) {

  server.create('config', 'default');
  const apiKey = 'valid-api-key';
  localStorage.setItem('pix-api-key', apiKey);
  server.create('user', { apiKey, trigram: 'ABC' });


  server.create('challenge', { id: 'recChallenge1' });
  server.create('skill', { id: 'recSkill1', challengeIds: ['recChallenge1'] });
  server.create('skill', { id: 'recSkill2', challengeIds: ['recChallenge1'] });
  server.create('tube', { id: 'recTube1', rawSkillIds: ['recSkill1'] });
  server.create('tube', { id: 'recTube2', rawSkillIds: ['recSkill2'] });
  server.create('competence', { id: 'recCompetence1.1', pixId: 'pixId recCompetence1.1', rawTubeIds: ['recTube1'] });
  server.create('competence', { id: 'recCompetence2.1', pixId: 'pixId recCompetence2.1', rawTubeIds: ['recTube2'] });
  server.create('area', { id: 'recArea1', name: '1. Information et données', code: '1', competenceIds: ['recCompetence1.1'] });
  server.create('area', { id: 'recArea2', name: '2. Communication et collaboration', code: '2', competenceIds: ['recCompetence2.1'] });

}

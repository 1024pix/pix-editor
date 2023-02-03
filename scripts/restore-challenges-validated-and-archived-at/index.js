const { Client } = require('pg');
const Cursor = require('pg-cursor');
const Airtable = require('airtable');
const _ = require('lodash');

function getStatus(status) {
  return {
    'validé sans test': 'validé',
    'pré-validé': 'validé',
  }[status] ?? status;
}
    
(async function() {
  const client = new Client({
  });
  let cursor;
      
  try {
    await client.connect();

    cursor = client.query(new Cursor('SELECT id, "createdAt", content FROM releases ORDER BY "createdAt"'));

    const challengesInfo = new Map();
    const statuses = new Set();
    
    while (true) { // eslint-disable-line no-constant-condition
      const releases = await cursor.read(10);
      if (!releases.length) break;

      for (const release of releases) {  
        console.log(`reading release ${release.id}`);

        for (const challenge of release.content.challenges) {
          const status = getStatus(challenge.status);
        
          if (!challengesInfo.has(challenge.id)) {
            challengesInfo.set(challenge.id, {
              recordId: null,
              id: challenge.id,
              status,
              validatedAt: null,
              archivedAt: null,
              madeObsoleteAt: null,
            });
          }

          const challengeInfo = challengesInfo.get(challenge.id);

          statuses.add(status);

          if (status === challengeInfo.status) continue;

          switch (status) {
            case 'validé':
              challengeInfo.validatedAt = release.createdAt;
              break;
            case 'archivé':
              challengeInfo.archivedAt = release.createdAt;
              break;
            case 'périmé':
              challengeInfo.madeObsoleteAt = release.madeObsoleteAt;
              break;
          }

          challengeInfo.status = status;
        }
      }
    }

    const challengesToUpdate = [...challengesInfo.values()].filter(({ validatedAt,archivedAt, madeObsoleteAt })=> validatedAt || archivedAt || madeObsoleteAt);
    console.log(challengesToUpdate);
    console.log('total:', challengesInfo.size);
    console.log('validated:', [...challengesInfo.values()].filter(({ validatedAt })=>validatedAt).length);
    console.log('archived:', [...challengesInfo.values()].filter(({ archivedAt })=>archivedAt).length);
    console.log('madeObsoleteAt:', [...challengesInfo.values()].filter(({ madeObsoleteAt })=>madeObsoleteAt).length);
    console.log(statuses);

    const airtableClient =  new Airtable({
      apiKey: ''
    }).base('');

    console.log('reading all challenges from Airtable...');
    const allChallenges = await airtableClient.table('Epreuves').select({
      fields: ['id persistant', 'validated_at', 'archived_at', 'made_obsolete_at'],
    }).all();

    const updates = [];
    for (const challengeToUpdate of challengesToUpdate) {
      const airtableChallenge = allChallenges.find((challenge) => {
        return challenge.fields['id persistant'] === challengeToUpdate.id;
      });
      const update = {
        id: airtableChallenge.id,
        fields: {}
      };
      if (challengeToUpdate.validatedAt != null && airtableChallenge.fields['validated_at'] == null) {
        update.fields['validated_at'] = challengeToUpdate.validatedAt;
      }
      if (challengeToUpdate.archivedAt != null && airtableChallenge.fields['archived_at'] == null) {
        update.fields['archived_at'] = challengeToUpdate.archivedAt;
      }      
      if (challengeToUpdate.madeObsoleteAt != null && airtableChallenge.fields['made_obsolete_at'] == null) {
        update.fields['made_obsolete_at'] = challengeToUpdate.madeObsoleteAt;
      }
      if (update.fields['validated_at'] || update.fields['archived_at'] || update.fields['made_obsolete_at']) {
        updates.push(update);
      }
    }

    const updatesChunks = _.chunk(updates, 10);

    console.log('updating records to Airtable...');
    for (const updatesChunk of updatesChunks) {
      await airtableClient.table('Epreuves').update(updatesChunk);
    }

    console.log('DONE!');
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    cursor.close();
    await client.end();
  }
})();

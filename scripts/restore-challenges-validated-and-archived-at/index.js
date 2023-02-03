const { Client } = require('pg');
const Cursor = require('pg-cursor');

function getStatus(status) {
  return {
    'validé sans test': 'validé',
    'pré-validé': 'validé',
  }[status] ?? status;
}
    
(async function() {
  const client = new Client({
    host: 'localhost',
    port: 5433,
    user: 'pix_lcms',
  });
  let cursor;
      
  try {
    await client.connect();

    cursor = client.query(new Cursor('SELECT id, "createdAt", content FROM releases ORDER BY "createdAt"'));

    const challengesInfo = new Map();
    const statuses = new Set();
    
    while (true) { // eslint-disable-line no-constant-condition
      const [release] = await cursor.read(1);
      if (!release) break;

      console.log(`reading release ${release.id}`);

      for (const challenge of release.content.challenges) {
        const status = getStatus(challenge.status);
        
        if (!challengesInfo.has(challenge.id)) {
          challengesInfo.set(challenge.id, {
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

    console.log('total:', challengesInfo.size);
    console.log('validated:', [...challengesInfo.values()].filter(({ validatedAt })=>validatedAt).length);
    console.log('archived:', [...challengesInfo.values()].filter(({ archivedAt })=>archivedAt).length);
    console.log('madeObsoleteAt:', [...challengesInfo.values()].filter(({ madeObsoleteAt })=>madeObsoleteAt).length);
    console.log([...challengesInfo.values()].filter(({ validatedAt,archivedAt, madeObsoleteAt })=> validatedAt || archivedAt || madeObsoleteAt));
    console.log(statuses);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    cursor.close();
    await client.end();
  }
})();

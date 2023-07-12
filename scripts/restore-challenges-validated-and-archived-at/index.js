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
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  let cursor;

  try {
    await client.connect();
    const result = await client.query('SELECT "createdAt" FROM releases ORDER BY "createdAt" limit 1');
    const oldestReleaseDate = result.rows[0]['createdAt'];

    // changelog
    const changelogChallengesInfo = await _parseChangelog(oldestReleaseDate);

    // bdd
    cursor = client.query(new Cursor('SELECT id, "createdAt", content FROM releases ORDER BY "createdAt"'));
    const releasesChallengesInfo = await _parseReleases(cursor);

    const challengesInfo = _mergeChallengesInfo(changelogChallengesInfo, releasesChallengesInfo);

    // airtable
    await _updateAirtable(challengesInfo);
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    cursor.close();
    await client.end();
  }
})();

function _mergeChallengesInfo(...challengesInfos) {
  const allChallengesInfo = new Map();

  for (const challengesInfo of challengesInfos) {
    for (const [id, newInfo] of challengesInfo) {
      if (allChallengesInfo.has(id)) {
        const oldInfo = allChallengesInfo.get(id);
        oldInfo.validatedAt = oldInfo.validatedAt ?? newInfo.validatedAt;
        oldInfo.archivedAt = oldInfo.archivedAt ?? newInfo.archivedAt;
        oldInfo.madeObsoleteAt = oldInfo.madeObsoleteAt ?? newInfo.madeObsoleteAt;
      } else {
        allChallengesInfo.set(id, newInfo);
      }
    }
  }

  return allChallengesInfo;
}

async function _parseReleases(cursor) {
  const challengesInfo = new Map();

  while (true) { // eslint-disable-line no-constant-condition
    const releases = await cursor.read(25);
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

        if (status === challengeInfo.status) continue;

        switch (status) {
          case 'validé':
            challengeInfo.validatedAt = release.createdAt;
            break;
          case 'archivé':
            challengeInfo.archivedAt = release.createdAt;
            break;
          case 'périmé':
            challengeInfo.madeObsoleteAt = release.createdAt;
            break;
        }

        challengeInfo.status = status;
      }
    }
  }

  return challengesInfo;
}

async function _parseChangelog(oldestReleaseDate) {
  const challengesInfo = new Map();

  const changelogAirtableClient = new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_EDITOR_DATABASE_ID);

  console.log(`reading all changelogs older than ${oldestReleaseDate} from Airtable changelog base...`);
  const allChangelogs = await changelogAirtableClient.table('Notes').select({
    fields: ['Texte', 'Record_Id', 'Date'],
  }).all();
  console.log('done');

  const dateFilteredChangelogs = allChangelogs
    .filter((changelog) => new Date(changelog.fields['Date']) < oldestReleaseDate)
    .sort((changelogA, changelogB) => {
      if (new Date(changelogA.fields['Date']) < new Date(changelogB.fields['Date'])) return -1;
      if (new Date(changelogA.fields['Date']) > new Date(changelogB.fields['Date'])) return 1;
      if (new Date(changelogA.fields['Date']) === new Date(changelogB.fields['Date'])) return 0;
    });

  const TEXT_VALIDATE_PROTO = 'Mise en production du prototype';
  const TEXT_VALIDATE_ALTER = 'Mise en production de la déclinaison';
  const TEXT_ARCHIVE = 'Archivage de l\'épreuve';
  const TEXT_OBSOLETE = 'Obsolescence de l\'épreuve';
  const TEXT_SUPPRESSION = 'Suppression de l\'épreuve';

  for (const changelog of dateFilteredChangelogs) {
    const challengeId = changelog.fields['Record_Id'];
    if (!challengesInfo.has(challengeId)) {
      challengesInfo.set(challengeId, {
        recordId: null,
        id: challengeId,
        status: null,
        validatedAt: null,
        archivedAt: null,
        madeObsoleteAt: null,
      });
    }
    const text = changelog.fields['Texte'];
    let challengeInfo;

    if (text.includes(TEXT_VALIDATE_PROTO) || text.includes(TEXT_VALIDATE_ALTER) || text.includes(TEXT_ARCHIVE) || text.includes(TEXT_OBSOLETE) || text.includes(TEXT_SUPPRESSION)) {
      if (!challengesInfo.has(challengeId)) {
        challengesInfo.set(challengeId, {
          recordId: null,
          id: challengeId,
          status: null,
          validatedAt: null,
          archivedAt: null,
          madeObsoleteAt: null,
        });
      }
      challengeInfo = challengesInfo.get(challengeId);
    }
    if (text.includes(TEXT_VALIDATE_PROTO) || text.includes(TEXT_VALIDATE_ALTER)) {
      challengeInfo.status = 'validé';
      challengeInfo.validatedAt = new Date(changelog.fields['Date']);
    }
    if (text.includes(TEXT_ARCHIVE)) {
      challengeInfo.status = 'archivé';
      challengeInfo.archivedAt = new Date(changelog.fields['Date']);
    }
    if (text.includes(TEXT_OBSOLETE) || text.includes(TEXT_SUPPRESSION)) {
      challengeInfo.status = 'périmé';
      challengeInfo.madeObsoleteAt = new Date(changelog.fields['Date']);
    }
  }

  return challengesInfo;
}

async function _updateAirtable(challengesInfo) {
  const challengesToUpdate = [...challengesInfo.values()].filter(({ validatedAt,archivedAt, madeObsoleteAt })=> validatedAt || archivedAt || madeObsoleteAt);
  console.log('validated:', [...challengesInfo.values()].filter(({ validatedAt })=>validatedAt).length);
  console.log('archived:', [...challengesInfo.values()].filter(({ archivedAt })=>archivedAt).length);
  console.log('madeObsoleteAt:', [...challengesInfo.values()].filter(({ madeObsoleteAt })=>madeObsoleteAt).length);

  const airtableClient =  new Airtable({
    apiKey: process.env.AIRTABLE_API_KEY,
  }).base(process.env.AIRTABLE_DATABASE_ID);

  console.log('reading all challenges from Airtable...');
  const allChallenges = await airtableClient.table('Epreuves').select({
    fields: ['id persistant', 'validated_at', 'archived_at', 'made_obsolete_at'],
  }).all();
  console.log('done');

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
  console.log('REAL total:', updates.length);

  console.log(updates);
  const updatesChunks = _.chunk(updates, 10);

  console.log('updating records to Airtable...');
  for (const updatesChunk of updatesChunks) {
    await airtableClient.table('Epreuves').update(updatesChunk);
  }

  console.log('DONE!');
}

import { Challenge, Mission } from '../../../lib/domain/models/index.js';
import { buildFramework, persistFrameworks } from './frameworks.js';
import { buildArea, persistAreas } from './areas.js';
import { buildCompetence, persistCompetences } from './competences.js';
import { buildThematic, persistThematics } from './thematics.js';
import { buildTube, persistTubes } from './tubes.js';
import { buildSkill, persistSkills } from './skills.js';
import { buildChallenge, persistChallenges } from './challenges.js';

export async function buildPixJunior({ airtableClient, databaseBuilder, logger, locales, indexFramework }) {
  logger.info('About to create whole framework Pix Junior...');
  const pixJuniorFrameworkItem = buildFramework({ name: 'Pix Junior' });
  await persistFrameworks({ items: [pixJuniorFrameworkItem], airtableClient, logger });

  const areaItem1 = buildArea({ indexFramework, indexArea: 0, frameworkItem: pixJuniorFrameworkItem, databaseBuilder, locales });
  const areaItem2 = buildArea({ indexFramework, indexArea: 1, frameworkItem: pixJuniorFrameworkItem, databaseBuilder, locales });
  await persistAreas({ items: [areaItem1, areaItem2], airtableClient, logger });

  const competenceItems = [];
  for (const configCompetence of [{ iCompetence: 0, iArea: 0, areaItem: areaItem1 }, { iCompetence: 1, iArea: 0, areaItem: areaItem1 }, { iCompetence: 0, iArea: 1, areaItem: areaItem2 }]) {
    const competenceItem = buildCompetence({ indexCompetence: configCompetence.iCompetence, areaItem: configCompetence.areaItem, databaseBuilder, locales });
    competenceItems.push(competenceItem);
  }
  await persistCompetences({ items: competenceItems, airtableClient, logger });

  const thematicItems = [];
  const workbenchThematicItems = [];
  for (const competenceItem of competenceItems) {
    for (let i = 0; i < 3; ++i) {
      const thematicItem = buildThematic({ indexThematic: i, competenceItem, databaseBuilder, locales, isWorkbench: false });
      thematicItem.isLastThematic = i === 2;
      thematicItems.push(thematicItem);
    }
    workbenchThematicItems.push(buildThematic({ competenceItem, databaseBuilder, locales, isWorkbench: true }));
  }
  await persistThematics({ items: [...thematicItems, ...workbenchThematicItems], airtableClient, logger });

  const tubeItems = [];
  const workbenchTubeItems = [];
  for (const thematicItem of thematicItems) {
    if (thematicItem.isLastThematic) {
      tubeItems.push(buildTube({ indexTube: 0, suffix: '_de', thematicItem, databaseBuilder, locales, isWorkbench: false }));
    } else {
      tubeItems.push(buildTube({ indexTube: 0, suffix: '_en', thematicItem, databaseBuilder, locales, isWorkbench: false }));
      tubeItems.push(buildTube({ indexTube: 1, suffix: '_di', thematicItem, databaseBuilder, locales, isWorkbench: false }));
      tubeItems.push(buildTube({ indexTube: 2, suffix: '_va', thematicItem, databaseBuilder, locales, isWorkbench: false }));
    }
  }
  for (const workbenchThematicItem of workbenchThematicItems) {
    workbenchTubeItems.push(buildTube({ thematicItem: workbenchThematicItem, databaseBuilder, locales, isWorkbench: true }));
  }
  await persistTubes({ items: [...tubeItems, ...workbenchTubeItems], airtableClient, logger });

  const skillItems = [];
  const workbenchSkillItems = [];
  for (const tubeItem of tubeItems) {
    skillItems.push(buildSkill({ indexSkill: 0, tubeItem, status: 'actif', version: 1, isWorkbench: false, databaseBuilder, locales }));
    skillItems.push(buildSkill({ indexSkill: 1, tubeItem, status: 'actif', version: 1, isWorkbench: false, databaseBuilder, locales }));
  }
  for (const workbenchTubeItem of workbenchTubeItems) {
    workbenchSkillItems.push(buildSkill({ tubeItem: workbenchTubeItem, isWorkbench: true, databaseBuilder, locales }));
  }
  await persistSkills({ items: [...skillItems, ...workbenchSkillItems], airtableClient, logger });

  const challengeItems = [];
  for (const skillItem of skillItems) {
    challengeItems.push(buildChallenge({ indexChallenge: 0, skillItem, status: Challenge.STATUSES.VALIDE, isProto: true, protoVersion: skillItem.version, decliVersion: null, databaseBuilder, locales }));
  }
  await persistChallenges({ items: challengeItems, airtableClient, logger });

  let iCompetence = 0;
  let iThematic = 0;
  for (const missionStatus of [Mission.status.VALIDATED, Mission.status.INACTIVE, Mission.status.EXPERIMENTAL]) {
    const competenceItem = competenceItems[iCompetence];
    const [thematicItem1, thematicItem2, thematicItem3] = thematicItems.slice(iThematic, 3 + iThematic);
    databaseBuilder.factory.buildMission({
      name: `Mission test au statut ${missionStatus}`,
      cardImageUrl: `https://example.net/image_for_${missionStatus}.png`,
      competenceId: competenceItem.id,
      learningObjectives: `Learning objectif pour ${missionStatus}`,
      thematicIds: [thematicItem1.id, thematicItem2.id, thematicItem3.id].join(','),
      validatedObjectives: `- Ca pour ${missionStatus}
 Et puis ça pour ${missionStatus}`,
      status: missionStatus,
      createdAt: new Date('2023-12-17'),
    });
    ++iCompetence;
    iThematic += 3;
  }
  logger.info('Done !');
}

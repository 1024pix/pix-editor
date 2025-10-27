import { tutorialDatasource } from '../../infrastructure/datasources/airtable/index.js';
import {
  areaRepository,
  attachmentRepository,
  challengeRepository,
  competenceRepository,
  frameworkRepository,
  missionRepository,
  skillRepository,
  thematicRepository,
  translationRepository,
  tubeRepository,
} from '../../infrastructure/repositories/index.js';
import {
  areaTransformer,
  competenceTransformer,
  fillAlternativeQualityFieldsFromMatchingProto,
  frameworkTransformer,
  missionTransformer,
  skillTransformer,
  thematicTransformer,
  tubeTransformer,
} from '../../infrastructure/transformers/index.js';
import { knex } from '../../../db/knex-database-connection.js';
import { prefixFor } from '../../infrastructure/translations/challenge.js';

/* https://github.com/nodejs/node/issues/41821
 Dans le cadre d'un appel API api/replication-data pour récupérer les données de la réplication, on renvoie un stream au client.
 Pour maintenir la connexion en vie, on envoie toutes les secondes un retour chariot.

 Malheureusement, ce usecase contient du code synchrone qui s'exécute dans le même tick et bloque la event-loop.
 Ce faisant, les retours chariot cessent d'être envoyés (car le setInterval n'a pas l'opportunité d'en placer une).
 Il y a encore de la marge d'amélioration sur l'algo, pour aller plus vite, mais on ne fait que repousser l'inévitable.
 Il faut s'assurer que le retour chariot régulièrement envoyé continue de l'être.
 Pour cela, il faut forcer, de temps en temps, ce usecase à rendre la main.
 */
const RELEASE_LOOP_EVERY_N_CHALLENGES = 5_000;
function setImmediatePromise() {
  return new Promise((resolve) => setImmediate(resolve));
}

export async function getLearningContentForReplication() {
  const [
    frameworks,
    areas,
    competences,
    thematics,
    tubes,
    skills,
    challenges,
    attachments,
    tutorials,
    courses,
    missions,
    translations,
  ] = await Promise.all([
    frameworkRepository.list(),
    areaRepository.list(),
    competenceRepository.list(),
    thematicRepository.list(),
    tubeRepository.list(),
    skillRepository.list(),
    challengeRepository.list(),
    attachmentRepository.list(),
    tutorialDatasource.list(),
    _getCoursesFromPGForReplication(),
    missionRepository.list(),
    translationRepository.list(),
  ]);
  const translationsForReplication = translations.map((translation, index) => ({
    ...translation,
    id: index + 1,
    model: translation.model,
    entityId: translation.entityId,
    sourceEntityId: null,
  }));
  const transformedTubes = tubeTransformer.transformTubes(tubes, challenges);

  const translationsGroupedByEntityId = Object.groupBy(
    translationsForReplication,
    (translation) => translation.entityId,
  );
  fillAlternativeQualityFieldsFromMatchingProto(challenges, skills);
  await setImmediatePromise();

  const allTranslatedChallenges = [];
  for (let i = 0; i < challenges.length; ++i) {
    const challenge = challenges[i];
    if (i % RELEASE_LOOP_EVERY_N_CHALLENGES === 0) {
      await setImmediatePromise();
    }
    const translatedChallenges = challenge.alternativeLocales.map((locale) => {
      const translationsForChallenge = translationsGroupedByEntityId[challenge.id].filter(
        (translation) => translation.locale === locale,
      );
      const localizedChallenge = challenge.translate(locale);
      for (const translationForChallenge of translationsForChallenge) {
        const translatedField = translationForChallenge.key.split('.')[2];
        translationForChallenge.key = `${prefixFor(localizedChallenge)}${translatedField}`;
        translationForChallenge.entityId = localizedChallenge.id;
        translationForChallenge.sourceEntityId = challenge.id;
      }
      localizedChallenge.area = localizedChallenge.geography;
      delete localizedChallenge.localizedChallenges;
      return localizedChallenge;
    });
    challenge.area = challenge.geography;
    delete challenge.localizedChallenges;
    allTranslatedChallenges.push(challenge);
    allTranslatedChallenges.push(...translatedChallenges);
  }

  const translatedAttachments = attachments.map((attachment) => ({
    id: attachment.id,
    type: attachment.type,
    url: attachment.url,
    size: attachment.size,
    filename: attachment.filename,
    challengeId: attachment.localizedChallengeId,
    alt: allTranslatedChallenges.find(({ id }) => id === attachment.localizedChallengeId).illustrationAlt,
  }));

  const transformedMissions = missionTransformer.transform({
    missions,
    challenges,
    tubes,
    thematics,
    skills,
  });

  await setImmediatePromise();
  return {
    frameworks: frameworkTransformer.forReplication(frameworks),
    areas: areaTransformer.forReplication(areas),
    competences: competenceTransformer.forReplication(competences),
    thematics: thematicTransformer.forReplication(thematics),
    tubes: transformedTubes,
    skills: skillTransformer.forReplication(skills),
    challenges: allTranslatedChallenges,
    attachments: translatedAttachments,
    tutorials,
    courses,
    missions: transformedMissions,
    translations: translationsForReplication.sort(byKeyAndLocale),
  };
}

function byKeyAndLocale(trA, trB) {
  const compareKey = trA.key.localeCompare(trB.key);
  if (compareKey === 0) {
    return trA.locale.localeCompare(trB.locale);
  }
  return compareKey;
}

async function _getCoursesFromPGForReplication() {
  return knex('static_courses').select(['id', 'name']).orderBy('id');
}

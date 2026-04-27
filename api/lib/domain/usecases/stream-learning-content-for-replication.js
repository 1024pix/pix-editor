import {
  areaRepository,
  attachmentRepository,
  challengeRepository,
  competenceRepository,
  frameworkRepository,
  missionRepository,
  moduleRepository,
  skillRepository,
  staticCourseRepository,
  thematicRepository,
  translationRepository,
  tubeRepository,
  tutorialRepository,
} from '../../infrastructure/repositories/index.js';
import {
  areaTransformer,
  competenceTransformer,
  frameworkTransformer,
  missionTransformer,
  skillTransformer,
  thematicTransformer,
} from '../../infrastructure/transformers/index.js';

export async function* streamLearningContentForReplication(signal) {
  const frameworks = await frameworkRepository.list();
  yield* wrapValuesWithType('frameworks')(frameworkTransformer.forReplication(frameworks));

  const areas = await areaRepository.list();
  yield* wrapValuesWithType('areas')(areaTransformer.forReplication(areas));

  const competences = await competenceRepository.list();
  yield* wrapValuesWithType('competences')(competenceTransformer.forReplication(competences));

  const thematics = await thematicRepository.list();
  yield* wrapValuesWithType('thematics')(thematicTransformer.forReplication(thematics));

  const tubes = await tubeRepository.listForReplication();
  yield* wrapValuesWithType('tubes')(tubes);

  const skills = await skillRepository.list();
  const pixFrameworkCompetenceIds = competences.filter(({ belongsToPixFramework }) => belongsToPixFramework).map(({ id }) => id);
  yield* wrapValuesWithType('skills')(skillTransformer.forReplication(skills, pixFrameworkCompetenceIds));

  const challengesStream = challengeRepository.streamForReplication(signal);
  const wrapChallenges = wrapValuesWithType('challenges');
  for await (const challenge of challengesStream) {
    const translatedChallenges = [challenge, ...challenge.alternativeLocales.map((locale) => challenge.translate(locale))];
    translatedChallenges.forEach((translatedChallenge) => {
      delete translatedChallenge.localizedChallenges;
    });
    yield* wrapChallenges(translatedChallenges);
  }

  const attachmentsStream = attachmentRepository.streamForReplication(signal);
  const wrapAttachment = wrapValueWithType('attachments');
  for await (const attachment of attachmentsStream) {
    yield wrapAttachment(attachment);
  }

  const tutorials = await tutorialRepository.list();
  yield* wrapValuesWithType('tutorials')(tutorials);

  const courses = await staticCourseRepository.listForReplication();
  yield* wrapValuesWithType('courses')(courses);

  const missions = await missionRepository.list();
  const missionsChallenges = await challengeRepository.listByThematicIds(missions.flatMap((mission) => mission.thematicIds));
  yield* wrapValuesWithType('missions')(missionTransformer.transform({
    missions,
    thematics,
    tubes,
    skills,
    challenges: missionsChallenges,
  }));

  const modules = await moduleRepository.listForReplication();
  yield* wrapValuesWithType('modules')(modules);

  const translationsStream = translationRepository.streamForReplication(signal);
  const wrapTranslation = wrapValueWithType('translations');
  for await (const translation of translationsStream) {
    yield wrapTranslation(translation);
  }
}

function wrapValuesWithType(type) {
  return (values) => Iterator.from(values).map(wrapValueWithType(type));
}

function wrapValueWithType(type) {
  return (value) => ({ type, value });
}

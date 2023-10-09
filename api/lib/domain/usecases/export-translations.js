import { Readable } from 'node:stream';
import csv from 'fast-csv';
import { releaseRepository } from '../../infrastructure/repositories/index.js';
import { extractFromChallenge } from '../../infrastructure/translations/challenge.js';
import { extractFromReleaseObject } from "../../infrastructure/translations/competence.js";

export async function exportTranslations(stream, dependencies = { releaseRepository }) {
  const release = await dependencies.releaseRepository.getLatestRelease();
  const csvStream = csv.format({ headers: true });
  csvStream.pipe(stream);

  const challengesStream = Readable.from(release.content.challenges)
        .filter((challenge) => challenge.locales.includes('fr'))
        .map((challenge) => {
          return {
            tags: extractTagsFromChallenge(challenge, release.content),
            challenge
          }
        })
        .flatMap(({ tags, challenge }) => {
          return extractFromChallenge(challenge).map((translation) => {
            return { tags, translation };
          });
        })
        .map(({ tags, translation: { key, value } }) => {
          return {
            key,
            fr: value,
            tags: tags.join(),
          };
        });

  const competencesStream = Readable.from(release.content.competences)
        .map((competence) => {
          return {
            tags: extractTagsFromCompetence(competence, release.content),
            competence
          }
        })
        .flatMap(({ tags, competence }) => {
          return extractFromReleaseObject(competence).map((translation) => {
            return { tags, translation };
          });
        })
        .filter(({ translation }) => translation.locale === 'fr')
        .map(({ tags, translation: { key, value }}) => {
          return {
            key,
            fr: value,
            tags: tags.join()
          };
        });

  challengesStream.pipe(csvStream);
  competencesStream.pipe(csvStream);
}

function extractTagsFromChallenge(challenge, releaseContent) {
  const skill = releaseContent.skills.find(({ id }) => {
    return id === challenge.skillId;
  });
  const tube = releaseContent.tubes.find(({ id }) => {
    return id === skill.tubeId;
  });
  const competence = releaseContent.competences.find(({ id }) => {
    return id === tube.competenceId;
  });
  return [
    skill.name,
    tube.name,
    ...extractTagsFromCompetence(competence, releaseContent),
  ];
}

function extractTagsFromCompetence(competence, releaseContent) {
  const area = releaseContent.areas.find(({ id }) => {
    return id === competence.areaId;
  });
  const framework = releaseContent.frameworks.find(({ id }) => {
    return id === area.frameworkId;
  });
  return [
    competence.index,
    area.code,
    framework.name
  ];
}

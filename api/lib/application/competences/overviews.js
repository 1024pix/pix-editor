import Joi from 'joi';
import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import { getCompetenceChallengesProductionOverview } from '../../domain/usecases/index.js';
import { competenceOverviewSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

const competenceIdType = Joi.string().pattern(/^(rec|competence)[a-zA-Z0-9]+$/).required();

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/competences/{competenceId}/overviews/challenges-production',
      config: {
        validate: {
          params: Joi.object({
            competenceId: competenceIdType,
          }),
          query: Joi.object({
            locale: Joi.string().min(2).max(5)
          }),
        },
        handler: async function(request) {
          try {
            const competenceId = request.params.competenceId;
            const locale = request.query.locale;

            const competenceOverview = await getCompetenceChallengesProductionOverview({ competenceId, locale });
            return competenceOverviewSerializer.serialize(competenceOverview);
          } catch (err) {
            logger.error(err);
            Sentry.captureException(err);
          }
        },
      },
    },
  ]);
}

export const name = 'competence-overviews';

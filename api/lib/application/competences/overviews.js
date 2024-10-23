import Joi from 'joi';
import Boom from '@hapi/boom';
import * as Sentry from '@sentry/node';
import { logger } from '../../infrastructure/logger.js';
import { getCompetenceChallengesProductionOverview } from '../../domain/usecases/index.js';
import { competenceOverviewSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import { Types } from '../types.js';

export async function register(server) {
  server.route([
    {
      method: 'GET',
      path: '/api/competences/{competenceId}/overviews/challenges-production',
      config: {
        validate: {
          params: Joi.object({
            competenceId: Types.competenceId().required(),
          }),
          query: Joi.object({
            locale: Types.locale(),
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
            return Boom.internal(err);
          }
        },
      },
    },
  ]);
}

export const name = 'competence-overviews';

import Joi from 'joi';
import {
  getCompetenceChallengesProductionOverview,
  getCompetenceChallengesWorkbenchOverview
} from '../../domain/usecases/index.js';
import { competenceOverviewSerializer } from '../../infrastructure/serializers/jsonapi/index.js';
import * as Types from '../types.js';

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
          const competenceId = request.params.competenceId;
          const locale = request.query.locale;

          const competenceOverview = await getCompetenceChallengesProductionOverview({ competenceId, locale });
          return competenceOverviewSerializer.serialize(competenceOverview);
        },
      },
    },
    {
      method: 'GET',
      path: '/api/competences/{competenceId}/overviews/challenges-workbench',
      config: {
        validate: {
          params: Joi.object({
            competenceId: Types.competenceId().required(),
          }),
        },
        handler: async function(request) {
          const competenceId = request.params.competenceId;

          const competenceOverview = await getCompetenceChallengesWorkbenchOverview({ competenceId });
          return competenceOverviewSerializer.serialize(competenceOverview);
        },
      },
    },
  ]);
}

export const name = 'competence-overviews';

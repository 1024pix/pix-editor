import { Mission } from '../../../../lib/domain/models/Mission.js';
import { MissionSummary } from '../../../../lib/domain/readmodels/index.js';

export function buildMissionSummary({
  id = 3,
  name = 'Ma mission',
  competence = '1.1 Traitement',
  createdAt = new Date('2023-10-14'),
  status = Mission.status.ACTIVE,
} = {}) {
  return new MissionSummary ({
    id,
    name,
    competence,
    createdAt,
    status,
  });
}

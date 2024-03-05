import {
  staticCourseTagRepository
} from '../../infrastructure/repositories/index.js';
import { staticCourseTagSerializer } from '../../infrastructure/serializers/jsonapi/index.js';

export async function list(request, h) {
  const tags = await staticCourseTagRepository.list();
  return h.response(staticCourseTagSerializer.serialize(tags));
}

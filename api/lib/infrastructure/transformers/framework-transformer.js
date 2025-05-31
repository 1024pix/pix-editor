import { FrameworkForRelease } from '../../domain/models/release/index.js';

export function transformForRelease(framework) {
  return new FrameworkForRelease({
    id: framework.id,
    name: framework.name,
  });
}

export function transformForReplication(framework) {
  return {
    id: framework.id,
    name: framework.name,
  };
}

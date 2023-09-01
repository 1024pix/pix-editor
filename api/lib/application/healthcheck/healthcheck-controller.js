import packageJSON from '../../../package.json' assert { type: 'json' };
import { environment } from '../../config.js';

export function get() {
  return {
    name: packageJSON.name,
    version: packageJSON.version,
    description: packageJSON.description,
    environment,
    'container-version': process.env.CONTAINER_VERSION,
    'container-app-name': process.env.APP,
  };
}

import Joi from 'joi';

import { logger as defaultLogger } from '../../infrastructure/logger.js';

const META_INFO_SCHEMA = Joi.object({
  description: Joi.string().required(),
  permanent: Joi.boolean().required(),
  options: Joi.object().optional(),
  commands: Joi.object().optional(),
});

/**
 * Class for scripts with meta information and execution handling.
 */
export class Script {
  /**
   * Constructs a Script instance.
   *
   * @param {object} metaInfo - The metadata for the script.
   * @param {string} metaInfo.description - A brief description of the script. Required.
   * @param {boolean} metaInfo.permanent - Indicates whether the script is permanent. Required.
   * @param {object} [metaInfo.options] - Options of the script, see doc: https://yargs.js.org/docs/#api-reference-optionskey-opt.
   * @param {object} [metaInfo.commands] - Commands of the script, see doc: https://yargs.js.org/docs/#api-reference-commandcmd-desc-builder-handler.
   */
  constructor(metaInfo) {
    const result = Joi.attempt(metaInfo, META_INFO_SCHEMA, {
      abortEarly: false,
    });
    this.metaInfo = result;
  }

  /**
   * Handles the core logic of the script.
   * This method must be implemented in script classes.
   *
   * @param {object} _params - The params.
   * @param {string} _params.command - The parsed command of the script.
   * @param {object} _params.options - The parsed options of the script.
   * @param {object} _params.logger - The logger for the script.
   */
  async handle(_params) {
    throw new Error('"handle" method must be implemented');
  }

  /**
   * Runs the script with the given options and logger.
   * If an error occurs, it calls `onError`. After completion, it calls `onFinished`.
   *
   * @param {object} _params - The params.
   * @param {object} _params.command - The parsed command of the script.
   * @param {object} _params.options - The parsed options of the script.
   * @param {object} [_params.logger=defaultLogger] - The logger for the script. Defaults to `defaultLogger`.
   * @throws {Error} If an error occurs during script execution.
   */
  async run({ command, options, logger = defaultLogger }) {
    try {
      await this.handle({ command, options, logger });
    } catch (error) {
      if (this.onError) await this.onError({ error, logger });

      throw error;
    } finally {
      if (this.onFinished) await this.onFinished({ logger });
    }
  }
}

import * as config from '../../config.js';
import { ModuleDuplicateIdsError } from '../errors.js';
import { moduleSchema } from '../../application/modules/validation/module-schema.js';
import { joiErrorParser } from '../../application/modules/joi-error-parser.js';

export class Module {
  constructor({
    id,
    shortId,
    internalTitle,
    slug,
    title,
    isBeta,
    visibility,
    details,
    sections,
    glossary,
    version,
    createdAt,
    updatedAt,
  } = {}) {
    this.id = id;
    this.shortId = shortId;
    this.internalTitle = internalTitle;
    this.slug = slug;
    this.title = title;
    this.isBeta = isBeta;
    this.visibility = visibility;
    this.details = details;
    this.sections = sections;
    this.glossary = glossary;
    this.version = version;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  get url() {
    return new URL(`/modules/${this.shortId}/${this.slug}`, config.pixApp.production.baseUrlFr).href;
  }

  get previewUrl() {
    return new URL(`/modules/preview/${this.shortId}/${this.slug}`, config.pixApp.production.baseUrlFr).href;
  }

  serializeToJSON() {
    const {
      id,
      shortId,
      internalTitle,
      slug,
      title,
      isBeta,
      visibility,
      details,
      sections,
      glossary,
    } = this;
    return JSON.stringify({
      id,
      shortId,
      internalTitle,
      slug,
      title,
      isBeta,
      visibility,
      details,
      sections,
      glossary,
    }, null, 2);
  }

  static get LEVELS() {
    return {
      NOVICE: 'novice',
      INDEPENDENT: 'independent',
      ADVANDCED: 'advanced',
      EXPERT: 'expert',
    };
  }

  static get VISIBILITIES() {
    return {
      PUBLIC: 'public',
      PRIVATE: 'private',
    };
  }

  toModuleValidation() {
    return {
      id: this.id,
      details: this.details,
      glossary: this.glossary,
      isBeta: this.isBeta,
      sections: this.sections,
      shortId: this.shortId,
      slug: this.slug,
      title: this.title,
      visibility: this.visibility,
    };
  }

  async validate({ modules }) {
    const moduleToValidate = this.toModuleValidation();
    const validationErrors = [];
    let isValid = true;

    try {
      await moduleSchema.validateAsync(moduleToValidate, { abortEarly: false });
    } catch (joiError) {
      validationErrors.push(...joiErrorParser.toStructuredErrors(joiError));
    }

    try {
      this.#validateModuleDoesNotHaveDuplicateIds({ moduleToValidate, modules });
    } catch (error) {
      validationErrors.push({ message: error.message, isSchemaError: false });
    }

    if (validationErrors.length > 0) {
      isValid = false;
    }

    return { isValid, validationErrors };
  }

  async validateSchema() {
    const moduleToValidate = this.toModuleValidation();
    const validationErrors = [];
    let isValid = true;

    try {
      await moduleSchema.validateAsync(moduleToValidate, { abortEarly: false });
    } catch (joiError) {
      validationErrors.push(...joiErrorParser.toStructuredErrors(joiError));
    }

    if (validationErrors.length > 0) {
      isValid = false;
    }

    return { isValid, validationErrors };
  }

  #validateModuleDoesNotHaveDuplicateIds({ moduleToValidate, modules }) {
    const otherModules = modules.filter((module) => (module.shortId !== moduleToValidate.shortId));

    const existingIds = new Set();
    for (const module of otherModules) {
      for (const id of this.#collectIds(module)) {
        existingIds.add(id);
      }
    }

    const duplicateIds = new Set();
    const draftIds = new Set();
    for (const id of this.#collectIds(moduleToValidate)) {
      if (draftIds.has(id) || existingIds.has(id)) {
        duplicateIds.add(id);
      }
      draftIds.add(id);
    }

    if (duplicateIds.size > 0) {
      throw new ModuleDuplicateIdsError(`Le brouillon a des ids dupliqués : ${Array.from(duplicateIds).join(', ')}`, Array.from(duplicateIds));
    }
  }

  #collectIds(module) {
    const ids = [module.id];

    for (const section of module.sections) {
      ids.push(section.id);

      for (const grain of section.grains) {
        ids.push(grain.id);

        for (const component of grain.components) {
          switch (component.type) {
            case 'element':
              ids.push(component.element.id);
              if (component.element.type === 'flashcards' || component.element.type === 'qab') {
                for (const card of component.element.cards) {
                  ids.push(card.id);
                }
              }
              break;
            case 'stepper':
              for (const step of component.steps) {
                for (const element of step.elements) {
                  ids.push(element.id);
                  if (element.type === 'flashcards' || element.type === 'qab') {
                    for (const card of element.cards) {
                      ids.push(card.id);
                    }
                  }
                }
              }
              break;
          }
        }
      }
    }

    return ids;
  }
}

import { ModuleDuplicateIdsError } from '../errors.js';

export class ModulesValidation {
  constructor({ modules }) {
    this.modules = modules;
  }

  validateDraftModuleDoesNotHaveDuplicateIds(draftModule) {
    const isDraftModuleOfAnExistingModule = (module) => (module.shortId === draftModule.shortId);
    const otherModules = this.modules.filter((module) => !isDraftModuleOfAnExistingModule(module));

    const existingIds = new Set();
    for (const module of otherModules) {
      for (const id of this.#collectIds(module)) {
        existingIds.add(id);
      }
    }

    const duplicateIds = new Set();
    const draftIds = new Set();
    for (const id of this.#collectIds(draftModule)) {
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

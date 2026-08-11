import { ModuleDuplicateIdsError } from '../errors.js';

export class ModulesValidation {
  constructor({ modules }) {
    this.modules = modules;
  }

  validateDraftModuleDoesNotHaveDuplicateIds(draftModule) {
    const isDraftModuleOfAnExistingModule = (module) => (module.shortId === draftModule.shortId);
    const computedModules = [...this.modules.filter((module) => !isDraftModuleOfAnExistingModule(module)), draftModule];

    const duplicateIds = new Set();
    const ids = new Set();

    for (const module of computedModules) {
      if (ids.has(module.id)) {
        duplicateIds.add(module.id);
      }
      ids.add(module.id);

      for (const section of module.sections) {
        if (ids.has(section.id)) {
          duplicateIds.add(section.id);
        }
        ids.add(section.id);

        for (const grain of section.grains) {
          if (ids.has(grain.id)) {
            duplicateIds.add(grain.id);
          }
          ids.add(grain.id);

          for (const component of grain.components) {
            switch (component.type) {
              case 'element':
                if (ids.has(component.element.id)) {
                  duplicateIds.add(component.element.id);
                }
                if (component.element.type === 'flashcards' || component.element.type === 'qab') {
                  for (const card of component.element.cards) {
                    if (ids.has(card.id)) {
                      duplicateIds.add(card.id);
                    }
                    ids.add(card.id);
                  }
                }
                ids.add(component.element.id);
                break;
              case 'stepper':
                for (const step of component.steps) {
                  for (const element of step.elements) {
                    if (ids.has(element.id)) {
                      duplicateIds.add(element.id);
                    }
                    if (element.type === 'flashcards' || element.type === 'qab') {
                      for (const card of element.cards) {
                        if (ids.has(card.id)) {
                          duplicateIds.add(card.id);
                        }
                        ids.add(card.id);
                      }
                    }
                    ids.add(element.id);
                  }
                }
                break;
            }
          }
        }
      }
    }

    if (duplicateIds.size > 0) {
      throw new ModuleDuplicateIdsError(`Le brouillon a des ids dupliqués : ${Array.from(duplicateIds).join(', ')}`, Array.from(duplicateIds));
    }
  }
}

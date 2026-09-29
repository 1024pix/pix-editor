/**
 * Ajoute les clés manquantes aux messages des éléments llm-messages d'une copie du module, sans modifier le module donné.
 *
 * @template {import('../models/index.js').Module} T
 * @param {T} module
 * @returns {{ updatedModule: T, numberOfUpdatedMessages: number }}
 */
export function addMissingKeysToLlmMessages(module) {
  const updatedModule = new module.constructor({ ...module, sections: structuredClone(module.sections) });
  const messages = getElements(updatedModule)
    .filter(isLlmMessagesElement)
    .flatMap((element) => element.props?.messages ?? [])
    .flat();

  let numberOfUpdatedMessages = 0;
  for (const message of messages) {
    if (addMissingKeys(message)) numberOfUpdatedMessages++;
  }
  return { updatedModule, numberOfUpdatedMessages };
}

function getElements(module) {
  return module.sections
    .flatMap((section) => section.grains)
    .flatMap((grain) => grain.components)
    .flatMap((component) => component.type === 'stepper'
      ? component.steps.flatMap((step) => step.elements)
      : [component.element]);
}

function isLlmMessagesElement(element) {
  return element.type === 'custom' && element.tagName === 'llm-messages';
}

/**
 * @returns {boolean} true si le message a été modifié
 */
function addMissingKeys(message) {
  let isUpdated = false;
  if (!Object.hasOwn(message, 'illustrations')) {
    message.illustrations = [];
    isUpdated = true;
  }
  if (!Object.hasOwn(message, 'attachmentName')) {
    message.attachmentName = '';
    isUpdated = true;
  }
  return isUpdated;
}

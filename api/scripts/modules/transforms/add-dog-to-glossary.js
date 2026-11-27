import { getElements } from '../helpers/get-elements.js';

const DOG_DEFINITION = '<p>Mammifère domestique de la famille des canidés, réputé pour sa fidélité envers l’humain.</p>';

export function addDogToGlossary(module) {
  const sections = structuredClone(module.sections);
  const textElement = getElements(sections).find(isTextElement);

  if (!textElement || textElement.content === DOG_DEFINITION) {
    return { sections, numberOfEditedObjects: 0 };
  }

  textElement.content = DOG_DEFINITION;
  return { sections, numberOfEditedObjects: 1 };
}

function isTextElement(element) {
  return element.type === 'text';
}

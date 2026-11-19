import { getElements } from '../helpers/get-elements.js';

const DEFAULT_MAX_WIDTH = 0;

/**
 * Sets maxWidth to 0 on every image element of the module that does not define it.
 *
 * @param {{ sections: Array }} module Module or draft module; only its sections are read, never modified.
 * @returns {{ sections: Array, numberOfEditedObjects: number }}
 *   An updated copy of the sections, and the number of images that received a maxWidth.
 */
export function addMissingMaxWidthToImages(module) {
  const sections = structuredClone(module.sections);
  const imagesWithoutMaxWidth = getElements(sections)
    .filter(isImageElement)
    .filter(hasNoMaxWidth);

  imagesWithoutMaxWidth.forEach(addDefaultMaxWidth);

  return { sections, numberOfEditedObjects: imagesWithoutMaxWidth.length };
}

function isImageElement(element) {
  return element.type === 'image';
}

function hasNoMaxWidth(image) {
  return !Object.hasOwn(image, 'maxWidth');
}

function addDefaultMaxWidth(image) {
  image.maxWidth = DEFAULT_MAX_WIDTH;
}

import { getElements } from '../helpers/get-elements.js';

export function addMissingKeysToLlmMessages({ sections }) {
  const transformedSections = structuredClone(sections);
  const messagesWithMissingKeys = getElements(transformedSections)
    .filter(isLlmMessagesElement)
    .flatMap(getMessages)
    .filter(hasMissingKeys);

  messagesWithMissingKeys.forEach(addMissingKeys);

  return { sections: transformedSections, numberOfEditedObjects: messagesWithMissingKeys.length };
}

function isLlmMessagesElement(element) {
  return element.type === 'custom' && element.tagName === 'llm-messages';
}

// Messages may be grouped in a nested array: [message, [message, message]]
function getMessages(element) {
  return (element.props?.messages ?? []).flat();
}

function hasMissingKeys(message) {
  return !Object.hasOwn(message, 'illustrations') || !Object.hasOwn(message, 'attachmentName');
}

function addMissingKeys(message) {
  if (!Object.hasOwn(message, 'illustrations')) message.illustrations = [];
  if (!Object.hasOwn(message, 'attachmentName')) message.attachmentName = '';
}

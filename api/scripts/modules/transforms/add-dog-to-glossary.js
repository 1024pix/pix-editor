const DOG_GLOSSARY_ENTRY = {
  words: ['chien', 'chiens'],
  definition: '<p>Mammifère domestique de la famille des canidés, réputé pour sa fidélité envers l’humain.</p>',
};

export function addDogToGlossary(module) {
  const glossary = structuredClone(module.glossary ?? []);

  if (glossary.some(hasDogWord)) {
    return { glossary, numberOfEditedObjects: 0 };
  }

  glossary.push(structuredClone(DOG_GLOSSARY_ENTRY));
  return { glossary, numberOfEditedObjects: 1 };
}

function hasDogWord(entry) {
  return entry.words.includes('chien');
}

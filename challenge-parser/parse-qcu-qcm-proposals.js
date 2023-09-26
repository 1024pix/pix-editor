// Cette expression régulière match les lignes commençant par un tiret (-) entouré ou non d'espaces
// et capture le reste de la ligne en n'incluant ni le tiret ni les espaces.
const proposalRegex = /^\s*-\s*(.*)/gm;

export function parseQCUQCMProposals(input) {
  if (typeof input !== 'string') return [];
  const matchedLines = input.matchAll(proposalRegex);
  return Array.from(matchedLines, ([, proposal]) => proposal);
}

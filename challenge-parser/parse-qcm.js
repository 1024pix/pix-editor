import { parseQCUQCMProposals } from './parse-qcu-qcm-proposals.js';
import { parseQCMSolutions } from './parse-qcm-solutions.js';

export function parseQCM(input) {
  const proposalValues = parseQCUQCMProposals(input.proposals);
  const solutionIndexes = parseQCMSolutions(input.solutions);

  for (const solutionIndex of solutionIndexes) {
    if (solutionIndex >= proposalValues.length)
      throw new TypeError('solutions should contain numbers lower or equal to proposals count');
  }

  let proposalId = 1;
  const proposals = proposalValues.map((value) => ({ id: `${proposalId++}`, value }));
  const solutions = solutionIndexes.map((solutionIndex) => proposals[solutionIndex].id);

  return {
    proposals,
    solutions,
  };
}

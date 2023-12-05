import { parseQCUQCMProposals } from './parse-qcu-qcm-proposals.js';
import { parseQCUSolution } from './parse-qcu-solution.js';

export function parseQCU(input) {
  const proposalValues = parseQCUQCMProposals(input.proposals);
  const solutionIndex = parseQCUSolution(input.solution);

  if (solutionIndex >= proposalValues.length) throw new TypeError('solution should be a number lower or equal to proposals count');

  let proposalId = 1;
  const proposals = proposalValues.map((value) => ({ id: `${proposalId++}`, value }));
  const solution = proposals[solutionIndex].id;

  return {
    proposals,
    solution,
  };
}

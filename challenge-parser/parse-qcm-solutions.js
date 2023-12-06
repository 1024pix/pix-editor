export function parseQCMSolutions(inputs) {
  if (typeof inputs !== 'string') {
    throw new TypeError('solution does not represent a number');
  }

  const inputsAsArray = inputs.split(',');
  const solutions = inputsAsArray.map((input) => {
    const number = parseInt(input);
    if (Number.isNaN(number)) throw new TypeError('solution does not represent a number');
    if (number < 1) throw new TypeError('solution should be a number greater than or equal to 1');
    return number - 1;
  });

  if (new Set(solutions).size < solutions.length) {
    throw new TypeError('solution should not be duplicated');
  }

  return solutions;
}

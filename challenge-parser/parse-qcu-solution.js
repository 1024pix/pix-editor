export function parseQCUSolution(input) {
  const number = parseInt(input);
  if (Number.isNaN(number)) throw new TypeError('solution does not represent a number');
  if (number < 1) throw new TypeError('solution should be a number greater than or equal to 1');
  return number - 1;
}

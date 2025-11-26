export function* cycle(arr) {
  if (arr.length === 0) return;
  while (true) {
    yield* arr;
  }
}

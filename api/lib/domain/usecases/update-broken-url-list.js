import { updateBrokenUrlTable } from '../../infrastructure/repositories/broken-url-repository.js';

export async function updateBrokenUrlList(brokenUrlList) {
  await updateBrokenUrlTable(brokenUrlList);
}

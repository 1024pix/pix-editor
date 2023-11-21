import fs from 'fs';

export function readJSONFile(baseFolder = import.meta.url, filename) {
  const fileUrl = new URL(baseFolder, filename);
  return JSON.parse(fs.readFileSync(fileUrl, 'utf-8'));
}

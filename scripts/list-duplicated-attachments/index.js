import { performance } from 'node:perf_hooks';
import { fileURLToPath } from 'node:url';
import { extname } from 'node:path';

export async function listDuplicatedAttachments({ lcmsApiKey }) {
  const res = await fetch('https://lcms.pix.fr/api/releases/latest', {
    headers: {
      Authorization: `Bearer ${lcmsApiKey}`,
    },
  });
  if (!res.ok) {
    throw new Error(res.statusText);
  }

  const { content: { challenges } } = await res.json();
 
  const challengesWithDuplicatedAttachments = challenges.filter(challengeHasDuplicateAttachments);

  challengesWithDuplicatedAttachments.forEach((challenge) => {
    console.log(`Challenge ${challenge.id} (${challenge.status} ${challenge.locales}) : ${challenge.attachments.join(', ')}`);
  });
}

function challengeHasDuplicateAttachments({ attachments }) {
  if (!attachments) return false;
  const extensions = Array.from(new Set(attachments.map((attachment) => extname(attachment))));
  return extensions.length !== attachments.length;
}

async function main() {
  const startTime = performance.now();
  console.log(`Script ${__filename} has started`);
  const { LCMS_API_KEY: lcmsApiKey } = process.env;
  await listDuplicatedAttachments({ lcmsApiKey });
  const endTime = performance.now();
  const duration = Math.round(endTime - startTime);
  console.log(`Script has ended: took ${duration} milliseconds`);
}

const __filename = fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === __filename;

if (isLaunchedFromCommandLine) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

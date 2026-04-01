import { Mime } from 'mime/lite';

import standardTypes from 'mime/types/standard.js';
import otherTypes from 'mime/types/other.js';

const mime = new Mime(standardTypes, otherTypes, {
  'image/x-xcf': ['xcf'],
});

/**
 * Determines the file's MIME type according to its name.
 *
 * If no MIME type can be determined
 * application/octet-stream is returned.
 *
 * @param {File} file File object to test
 * @returns {string} MIME type
 */
export default function getMimeType(file) {
  if (file.type) return file.type;
  return mime.getType(file.name) ?? 'application/octet-stream';
}

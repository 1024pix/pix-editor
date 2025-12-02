import { Mime } from 'mime/lite';

import standardTypes from 'mime/types/standard.js';
import otherTypes from 'mime/types/other.js';

const mime = new Mime(standardTypes, otherTypes, {
  'image/x-xcf': ['xcf'],
});

export default function getMimeType(pathOrExtension) {
  return mime.getType(pathOrExtension);
}

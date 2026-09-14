import { JSONAPISerializer } from '@warp-drive/legacy/serializer/json-api';

export default class ApplicationSerializer extends JSONAPISerializer {
  shouldSerializeHasMany() {
    return true;
  }
}

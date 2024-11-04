import JsonapiSerializer from 'jsonapi-serializer';
import _ from 'lodash';

const { Error: JSONAPIError } = JsonapiSerializer;

export function serialize(infrastructureError) {
  if (!Array.isArray(infrastructureError)) infrastructureError = [infrastructureError];

  return JSONAPIError(
    infrastructureError.map((error) => {
      const source = error.attribute ?
        { pointer: `/data/attributes/${_.kebabCase(error.attribute)}` } :
        undefined;
      return {
        status: `${error.status}`,
        title: error.title,
        detail: error.detail ?? error.message,
        source,
        code: error.code,
      };
    }),
  );
}

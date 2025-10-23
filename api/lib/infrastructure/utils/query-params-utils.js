import _ from 'lodash';

// query example: 'filter[organizationId]=4&page[size]=30$page[number]=3&sort=createdAt[desc]&include=user'
// Warning: there is not any order between sort parameters
export function extractParameters(query, defaultQuery) {
  return {
    filter: _.defaults(extractFilter(query), defaultQuery?.filter),
    page: _.defaults(extractPage(query), defaultQuery?.page),
    sort: extractSort(query) ?? defaultQuery?.sort,
    include: extractArrayParameter(query, 'include') ?? defaultQuery?.include,
  };
}

function extractFilter(query) {
  const regex = /filter\[([a-zA-Z]*)\]/;
  return extractObjectParameter(query, regex);
}

function extractSort(query) {
  const sortArray = extractArrayParameter(query, 'sort');
  if (!sortArray.length) return undefined;
  return sortArray.map((field) => {
    const desc = field.startsWith('-');
    return [desc ? field.slice(1) : field, desc ? 'desc' : 'asc'];
  });
}

function extractPage(query) {
  const regex = /page\[([a-zA-Z]*)\]/;
  const params = extractObjectParameter(query, regex);
  return convertObjectValueToInt(params);
}

function extractObjectParameter(query, regex) {
  return _.reduce(
    query,
    (result, queryFilterValue, queryFilterKey) => {
      const parameter = queryFilterKey.match(regex);
      if (parameter && parameter[1]) {
        if (queryFilterKey.endsWith('[]')) {
          result[parameter[1]] = Array.isArray(queryFilterValue) ? queryFilterValue : [queryFilterValue];
        } else {
          result[parameter[1]] = queryFilterValue;
        }
      }
      return result;
    },
    {},
  );
}

function extractArrayParameter(query, parameterName) {
  return _.has(query, parameterName) ? query[parameterName].split(',') : [];
}

function convertObjectValueToInt(params) {
  return _.mapValues(params, _.toInteger);
}

import { Client } from '@elastic/elasticsearch';
const client = new Client({
  node: 'http://localhost:9200', // Elasticsearch endpoint

});

export async function index(challenge) {
  await client.index({
    id: challenge.id,
    index: 'challenges',
    body: {
      ...challenge,
    },
    refresh: true,
  });
}

export async function search(params) {
  const result = await client.search({
    index: 'challenges',
    fields: ['*'],
    body: {
      query: {
        multi_match: {
          query: params.filter.search,
        }
      }
    }
  });
  return result.hits.hits.map((hit) => {
    return hit._source;
  });
}

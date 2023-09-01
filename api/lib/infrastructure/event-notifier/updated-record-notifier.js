export async function notify({ pixApiClient, updatedRecord, model }) {
  return pixApiClient.request({ payload: updatedRecord, url: `/api/cache/${model}/${updatedRecord.id}` });
}

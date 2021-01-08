module.exports = {
  async notify({ pixApiClient, updatedRecord, model }) {
    return pixApiClient.request({ payload: updatedRecord, url: `/api/cache/${model}/${updatedRecord.id}` });
  }
};

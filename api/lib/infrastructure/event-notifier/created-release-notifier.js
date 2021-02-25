module.exports = {
  async notify({ pixApiClient  }) {
    return pixApiClient.request({ url: '/api/cache/' });
  }
};

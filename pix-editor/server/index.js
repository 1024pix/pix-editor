const morgan = require('morgan');

module.exports = function(app, options) {
  if (options.proxy) {
    const proxy = require('http-proxy').createProxyServer({
      target: options.proxy,
      ws: true,
      secure: options.secureProxy,
      changeOrigin: true,
      xfwd: options.transparentProxy,
      preserveHeaderKeyCase: true,
      proxyTimeout: options.proxyOutTimeout,
      timeout: options.proxyInTimeout,
    });

    proxy.on('error', (e) => {
      options.ui.writeLine(`Error proxying to ${options.proxy}`);
      options.ui.writeError(e);
    });

    app.use(morgan('dev'));
    app.get('/api/challenges/:id/preview', (req, res) => proxy.web(req, res));
  }
};

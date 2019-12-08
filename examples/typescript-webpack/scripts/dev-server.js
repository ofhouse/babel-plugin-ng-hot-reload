'use strict';

const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

const config = require('../webpack.config.js');

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const PORT = parseInt(process.env.PORT, 10) || 3000;
const host = process.env.HOST || '0.0.0.0';

new WebpackDevServer(webpack(config), {
  publicPath: '/',
  hot: true,
  host,
  https: protocol === 'https',
  historyApiFallback: true,
  disableHostCheck: true,
  open: true,
}).listen(PORT, host, function(err, result) {
  if (err) {
    return console.log(err);
  }

  console.log(`Listening ${host}:${PORT}`);
});

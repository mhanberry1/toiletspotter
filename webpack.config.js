const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync(
    {
      ...env,
      // Use relative paths for all assets
      publicPath: './',
    },
    argv
  );
  
  // Add CORS configuration for toiletspotter.org
  if (config.devServer) {
    config.devServer.headers = {
      'Access-Control-Allow-Origin': 'https://toiletspotter.org',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'X-Requested-With, content-type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    };
  }
  
  return config;
};

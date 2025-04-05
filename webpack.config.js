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
  
  // Add any custom configurations here
  
  return config;
};

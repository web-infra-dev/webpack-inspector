const { InspectorWebpackPlugin } = require('../../dist/index.js');

/**
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.ts/,
        loader: require.resolve('ts-loader'),
        options: {
          transpileOnly: true,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts'],
  },
  plugins: [
    new InspectorWebpackPlugin({
      port: 3334,
    }),
  ],
};

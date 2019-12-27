const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, 'Regex.ts'),
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ],
  },
  mode: 'production',
  output: {
    filename: 'bundle.js',
    path: __dirname,
    libraryTarget: 'var',
  },
};
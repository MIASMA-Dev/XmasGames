const path = require('path');
const { join } = require('path');

module.exports = {
  mode: 'production',
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.scss$/,
        use: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.json$/,
        type: 'json',
      },
    ],
  },
  experiments: {
    css: true,
  },
  devServer: {
    static: './dist',
    historyApiFallback: true,
  },
};
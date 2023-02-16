const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BASE_PATH = process.env.BASE_PATH || '';

let COMMIT_HASH;
try {
COMMIT_HASH = process.env.COMMIT_HASH || require("child_process")
  .execSync("git rev-parse --short HEAD")
  .toString()
  .trim()
} catch {
  // the most unimportant thing to fail a build on ever
  // so default to empty just in case
  commitHash = ""
  }

const config = (env, argv) => ({
  entry: './src/index.tsx',
  devtool: 'inline-source-map',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'main.js',
    publicPath: `${BASE_PATH}/`,
  },
  devServer: {
    static: path.resolve(__dirname, 'dist'),
    compress: true,
    port: 3000,
    open: true,
    historyApiFallback: true,
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(png|jpe?g|gif)$/i,
        use: 'file-loader',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
    new webpack.DefinePlugin({
      'process.env.BASE_PATH': JSON.stringify(BASE_PATH),
    }),
    new webpack.DefinePlugin({
      'process.env.COMMIT_HASH': JSON.stringify(COMMIT_HASH),
    }),
  ],
});

module.exports = config;

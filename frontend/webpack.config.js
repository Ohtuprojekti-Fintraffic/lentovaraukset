const path = require('path');
const webpack = require("webpack")
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BASE_PATH = process.env.BASE_PATH || '';

const config = (env, argv) => {
  const HtmlWebpackPlugin = require('html-webpack-plugin');
  return {
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
          use: [
            {
              loader: 'file-loader',
            },
          ],
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
    ],
  };
};

module.exports = config;

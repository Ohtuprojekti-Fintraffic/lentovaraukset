const path = require('path')

const config = (env, argv) => {
  const HtmlWebpackPlugin = require("html-webpack-plugin");
    return {
      entry: './src/index.tsx',
      devtool: 'inline-source-map',
      output:{
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js',
        publicPath: '/'
      },
      devServer: {
        static: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 3000,
        open: true,
        historyApiFallback: true,
        proxy: {
          '/api': 'http://localhost:8080',
        }
      },
      module: {
        rules:[
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
                loader: "file-loader",
              },
            ],
          }
        ]
      },
      resolve: {
        extensions: ['.tsx', '.ts', '.js'],
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: "./public/index.html"
        }),
      ]
    }
}

module.exports = config
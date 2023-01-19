const path = require('path')

const config = (env, argv) => {
    return {
        entry: './src/index.tsx',
        devtool: 'inline-source-map',
    output:{
        path: path.resolve(__dirname, 'dist'),
        filename: 'main.js'
    },
    devServer: {
        static: path.resolve(__dirname, 'dist'),
        compress: true,
        port: 3000,
      },
      devtool: 'source-map',
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
        ]
      },
    resolve: {
      extensions: ['.tsx', '.ts', '.js'],
      }
    }
}

module.exports = config
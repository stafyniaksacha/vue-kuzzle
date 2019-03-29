const path = require('path');
const webpack = require('webpack');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: './lib/index.js',
  output: {
    path: path.join(__dirname, '../dist'),
    filename: 'vue-plugin-kuzzle.js',
    libraryTarget: 'umd',
    library: 'VuePluginKuzzle'
  },
  resolve: {
    extensions: ['.js', '.vue'],
    modules: ['node_modules']
  },
  externals: {
    vue: 'vue',
    'kuzzle-sdk': 'kuzzle-sdk'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.css$/,
        use: ['vue-style-loader', 'css-loader']
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'img/[name].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'fonts/[name].[ext]'
        }
      },
      {
        test: /\.vue$/,
        use: [
          {
            loader: 'vue-loader'
          }
        ]
      }
    ]
  },
  plugins: [new UglifyJSPlugin()]
};

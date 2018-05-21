module.exports = {
  entry: {
    app: './src/app.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [/node_modules/],
        query: {
          presets: ['es2017']
        }
      }
    ]
  },
  devServer: {
    stats: {
      warnings: false
    }
  },
  output: {
    filename: 'bundle.js'
  },

  devtool: 'source-maps'
};

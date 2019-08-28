module.exports = {
  mode: 'production',
  output: {
    filename: 'main.js'
  },
  module: {
    rules: [
      {
        test: /\.js.html$/,
        use: [
          {
            loader: './lib/loader',
          }
        ]
      }
    ]
  }
};
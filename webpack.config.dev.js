const path = require("path");

module.exports = {
  entry: ["babel-polyfill", path.join(__dirname, "src/quickCanvas.ts")],
  output: {
    path: __dirname,
    filename: "lib/quickCanvas.min.js"
  },
  resolve: {
    extensions: ["", ".js", ".ts"]
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [
        {
          loader:"babel-loader",
          options:{
            presets:"es2015"
          }
        },
        { 
          loader:"ts-loader"
        }]

      },
    ]

  },
  resolveLoader: {
    root: path.join(__dirname, 'node_modules')
  },
  devtool: "source-map",
  devServer: {
    inline: true
  }
};

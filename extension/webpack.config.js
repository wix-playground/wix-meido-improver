const HtmlWebPackPlugin = require("html-webpack-plugin");
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    background: './src/background/script.js',
    content: './src/content/script.js',
    options: './src/options/script.js',
    popup: './src/popup/script.js',
  },
  resolve: {
    extensions: ['.js', '.jsx']
  },
  optimization: {
    minimize: false
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {loader: "babel-loader"}
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader']
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: ['file-loader', 'image-webpack-loader']
      },
      {
        test: /\.html$/,
        use: {loader: "html-loader"}
      }
    ]
  },
  plugins: [
    new HtmlWebPackPlugin({template: './src/options/page.html', filename: 'options.html', chunks: ['options']}),
    new HtmlWebPackPlugin({template: './src/popup/page.html', filename: 'popup.html', chunks: ['popup']}),
    new CopyPlugin([{from: './static'}]),
    new MiniCssExtractPlugin({
      filename: '[name].css',
      chunkFilename: '[id].css',
      ignoreOrder: false, // Enable to remove warnings about conflicting order
    }),
  ]
};

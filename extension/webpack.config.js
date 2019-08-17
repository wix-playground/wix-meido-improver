const HtmlWebPackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
  entry: {
    background: './src/background/script.ts',
    content: './src/content/script.ts',
    options: './src/options/script.ts',
    popup: './src/popup/index.tsx',
  },
  resolve: {
    extensions: ['.js', '.ts', '.tsx', '.scss'],
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.ts(x?)$/,
        exclude: /node_modules/,
        use: 'ts-loader',
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.module\.scss$/,
        use: [MiniCssExtractPlugin.loader, 'css-loader?modules=true', 'sass-loader'],
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        use: ['file-loader', 'image-webpack-loader'],
      },
      {
        test: /\.html$/,
        use: {loader: 'html-loader'},
      },
    ],
  },
  plugins: [
    new HtmlWebPackPlugin({template: './src/options/page.html', filename: 'options.html', chunks: ['options']}),
    new HtmlWebPackPlugin({template: './src/popup/page.html', filename: 'popup.html', chunks: ['popup']}),
    new CopyPlugin([{from: './static'}]),
    new MiniCssExtractPlugin({filename: '[name].css'}),
  ],
};

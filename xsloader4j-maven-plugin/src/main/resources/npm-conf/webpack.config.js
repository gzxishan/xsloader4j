const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const svgRule = {
  test: /\.svg$/,
  use: [
    {
      loader: 'html-loader',
      options: {
        minimize: true,
      },
    },
  ],
};

const cssRule={
  test:/\.css$/,
  use:[MiniCssExtractPlugin.loader, 'css-loader']
};

const stylRule = {
  test: /\.styl$/,
  use: [MiniCssExtractPlugin.loader, 'css-loader', 'stylus-loader'],
};

const scssRule={
    test:/\.scss$/,
    use:[MiniCssExtractPlugin.loader, 'css-loader','sass-loader']
};

const lessRule={
    test:/\.less$/,
    use:[MiniCssExtractPlugin.loader, 'css-loader','less-loader']
};

const tsRule = {
  test: /\.ts$/,
  use: [
    {
      loader: 'ts-loader',
      options: {
        compilerOptions: {
          declaration: false,
          module: 'es6',
          sourceMap: true,
          target: 'es6',
        },
        transpileOnly: true,
      },
    },
  ],
};

module.exports = {
	mode: '#{mode}',
	context: path.resolve(__dirname, '.'),
    entry: #{entry},
    output: {
        library:"#{library}",
		libraryTarget: 'umd',
        path: __dirname + "/dist", // 打包后的文件存放的地方
        filename: "[name]" // 打包后输出文件的文件名
    },
	devtool:"source-map",
	target: ['web', 'es5'],
	externals:#{externals},
	module:{
		rules:[svgRule,cssRule,stylRule,scssRule,lessRule,tsRule]
	},
	plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
   ],
}


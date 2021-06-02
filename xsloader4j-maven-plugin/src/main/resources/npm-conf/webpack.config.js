const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

const hasSourceMap=#{sourceMap};

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

const jsRule={
     test: /\.js$/,
     //exclude: /node_modules/,
     use: {
         loader: 'babel-loader',
         options: {
             presets: [
                 [
                     '@babel/preset-env',
                     {
                         // 需要兼容到以下浏览器的什么版本
                         "targets": {
                             "ie": 11,
                             "edge": "17",
                             "firefox": "60",
                             "chrome": "67",
                             "safari": "11.1",
                         },
                     }
                 ]
             ]
         }
     }
 };

const tsRule = {
  test: /\.ts$/,
  //exclude: /node_modules/,
  use: [
    {
      loader: 'ts-loader',
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
    resolve: {
        extensions: ['.ts','.tsx', '.js', '.json']
    },
//	optimization: {
//        minimizer: [
//          new UglifyJsPlugin({
//            sourceMap: hasSourceMap,
//          }),
//        ],
//    },
	target: 'web',
	devtool:'source-map',
	externals:#{externals},
	module:{
		rules:[jsRule,svgRule,cssRule,stylRule,scssRule,lessRule,tsRule]
	},
	plugins: [
        new MiniCssExtractPlugin({
          filename: '[name].css',
        }),
   ],
}


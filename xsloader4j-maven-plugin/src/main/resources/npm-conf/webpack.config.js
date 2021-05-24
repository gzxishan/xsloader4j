

module.exports = {
	mode: 'production',
    entry:  __dirname + "/main.js", // 之前提到的唯一入口文件
    output: {
		libraryTarget: 'umd',
        path: __dirname + "/dist", // 打包后的文件存放的地方
        filename: "#{name}.js" // 打包后输出文件的文件名
    },
	devtool:"source-map",
	target: ['web', 'es5']
}


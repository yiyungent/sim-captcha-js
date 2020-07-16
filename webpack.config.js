var path = require('path')
var webpack = require('webpack')

module.exports = {
  // 根据不同环境走不同入口
  entry: './src/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    filename: 'sim-captcha.js',
    library: 'sim-captcha', // 指定使用require时的模块名
    libraryTarget: 'umd', // 指定输出格式
    umdNamedDefine: true // 会对 UMD 的构建过程中的 AMD 模块进行重命名。否则就使用匿名的 define
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ],
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg|gif|svg)$/,
        loader: 'file-loader',
        options: {
          name: '/imgs/[name].[ext]?[hash]'
        }
      },
      {
        test: /\.(png|woff|woff2|svg|ttf|eot)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 100000,  //这里要足够大这样所有的字体图标都会打包到css中
          }
        }
      }
    ]
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    },
    extensions: ['*', '.js', '.json']
  },
  devServer: {
    historyApiFallback: true,
    noInfo: true,
    overlay: true,
    // contentBase: "",
  },
  performance: {
    hints: false
  },
  devtool: '#eval-source-map'
}


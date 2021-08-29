var path = require('path')
const TerserPlugin = require("terser-webpack-plugin");
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

// 目前配置: css, fonts, 小图等会被打包到一个 js 中, js 混淆压缩，去除注释, css不会去除注释

module.exports = {
  mode: 'production',
  entry: './src/main.js',
  output: {
    filename: 'sim-captcha.min.js',
    library: {
      name: 'SimCaptcha', // 指定使用require时的模块名, 并且 在浏览器中 使用时, 也将为 SimCaptcha
      type: 'umd', // 指定输出格式
    },
    libraryExport: "default",
    umdNamedDefine: true, // 会对 UMD 的构建过程中的 AMD 模块进行重命名。否则就使用匿名的 define
    path: path.resolve(__dirname, './dist'),
    publicPath: '/dist/',
    clean: true,
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
    contentBase: "./",
  },
  // devtool: '#eval-source-map',
  optimization: {
    minimize: true,
    minimizer: [

      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),

      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: [
            'default',
            {
              discardComments: { removeAll: true },
            },
          ],
        },
      }),

    ],
  },
  plugins: [
    
  ]
}


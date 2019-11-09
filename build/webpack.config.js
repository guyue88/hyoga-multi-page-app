const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const isDev = process.env.NODE_ENV === 'development';
const pageRoot = path.resolve(__dirname, '../src/pages');
const dist = path.resolve(__dirname, '../dist');
const entryScriptExt = 'ts';// 入口文件是ts文件

const config = {
  devtool: isDev ? 'inline-source-map' : 'none',
  mode: 'development',
  entry: {},
  output: {
    filename: 'assets/js/[name].[hash:8].js',
    path: dist,
  },
  resolve: {
    extensions: ['.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [{
      test: /\.(ts|js)?$/,
      exclude: /(node_modules|bower_components)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-typescript',
          ],
          plugins: [
            '@babel/plugin-proposal-class-properties',
            '@babel/plugin-proposal-object-rest-spread'
          ],
        }
      }
    }, {
      test: /\.scss$/,
      use: [{
        loader: MiniCssExtractPlugin.loader,
      }, {
        loader: 'css-loader',
      }, {
        loader: 'sass-loader',
      }],
    }, {
      test: /\.(png|jpg|gif|jpeg|webp|svg|bmp|eot|ttf|woff)$/,
      use: [{
        loader: 'url-loader',
        options: {
          limit: 8192,
          name:'assets/images/[name]-[hash:8].[ext]',
        }
      }]
    }, {
      test: /\.(html)$/,
      use: {
        loader: 'html-loader',
        options: {
          attrs: [':data-src', ':src'],
        }
      },
    }, ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'assets/css/[name].[hash:8].css',
      chunkFilename: '[id].css',
      ignoreOrder: false,
    }),
    new CleanWebpackPlugin(),
  ],
};

isDev && (config.devServer = {
  contentBase: path.join(__dirname, 'dist'),
  compress: true,
  inline: true,
  port: 10086,
});

readDir(pageRoot).forEach(dir => {
  const entry = path.resolve(dir, `index.${entryScriptExt}`);
  if (isFileExistSync(entry)) {
    const { name } = path.parse(dir);
    const page = path.resolve(dir, 'index.html');
    const htmlWebpackPluginConfig = {
      filename: `${name}.html`,
      chunks: [name],
      minify: !isDev && {
        removeAttributeQuotes:true,
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes:true,
        removeStyleLinkTypeAttributes:true
      },
    };
    if (isFileExistSync(page)) {
      htmlWebpackPluginConfig.template = page;
    }
    config.entry[name] = entry;
    config.plugins.push(new HtmlWebpackPlugin(htmlWebpackPluginConfig));
  }
});

/**
 * 同步判断文件是否存在
 * 
 * @param {string} file 文件地址
 */
function isFileExistSync(file) {
  try {
    fs.accessSync(file, fs.constants.F_OK);
  } catch (err) {
    return false;
  }
  return true;
}

/**
 * 遍历某个文件夹，找出该文件夹下的所有一级子文件夹
 * 
 * @param {string} dir 文件目录地址
 */
function readDir(dir) {
  let res = [];
  const list = fs.readdirSync(dir);
	list.forEach(file => {
    const pageDir = path.resolve(dir, file);
		const info = fs.statSync(pageDir);	
		if(info.isDirectory()){
      res.push(pageDir);
      // 暂时不要多层嵌套
			// res = [...res, ...readDir(pageDir)];
		}
  });
  return res;
}

module.exports = config;

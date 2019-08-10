const path = require('path');
const webpack = require('webpack')
const packagejson = require("./package.json")
const CompressionPlugin = require("compression-webpack-plugin");
const HtmlWebpackPlugin = require('html-webpack-plugin')
module.exports = {
    devtool: 'eval-source-map',
    mode: "development",
    cache: true,
    devServer: {
        contentBase: './dist'
    },
    externals: {
        "vue": "Vue",
    },
    resolve: {
        alias: {
            'vue': 'vue/dist/vue.min.js',
            'vue-clipboard2': 'vue-clipboard2/vue-clipboard.js'
        }
    },
    entry: {
        app: './src/index.ts',
        vendor: Object.keys(packagejson.dependencies),
    },
    output: {
        filename: '[name].[chunkhash:6].js',
        chunkFilename: '[name].[chunkhash:6].bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    plugins: [
        new CompressionPlugin({
            algorithm: 'gzip',
            test: new RegExp(
                '\\.(js|css)$'
            ),
            threshold: 10240,// gt 10 KB
            minRatio: 0.8
        }),
        new webpack.HashedModuleIdsPlugin(),
        new HtmlWebpackPlugin({
            filename: "index.html",
            minify: {
                removeComments: true,
                collapseWhitespace: true,
                removeRedundantAttributes: true,
                useShortDoctype: true,
                removeEmptyAttributes: true,
                removeStyleLinkTypeAttributes: true,
                keepClosingSlash: true,
                minifyJS: true,
                minifyCSS: true,
                minifyURLs: true,
            },
            chunksSortMode: 'dependency',
            template: './src/index.html'
        }),
    ],
    optimization: {
        splitChunks: {
            chunks: "all"
        }
    },
    module: {
        rules: [
            {
                test: /\.ts?$/,
                exclude: /node_modules/,
                use: [
                    {loader: "ts-loader"}
                ]
            }, {
                test: /\.css$/,
                use: [
                    'style-loader',
                    'css-loader'
                ]
            }
        ]
    }
};

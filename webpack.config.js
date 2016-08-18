'use strict';

let webpack = require('webpack');
let path = require('path');

module.exports = {
    devtool: 'eval',
    output: {
        path: './public/built',
        filename: 'bundle.js',
        publicPath: 'http://localhost:8080/built/'
    },
    devServer: {
        contentBase: './public',
        publicPath: 'http://localhost:8080/built/'
    },
    module: {
        loaders: [{
            test: /\.jsx?$/,
            exclude: [/node_modules/],
            loader: 'react-hot-loader'
        }, {
            test: /\.jsx?$/,
            exclude: [/node_modules/],
            loader: 'babel-loader',
            query: {
                presets: ['es2015', 'react',
                    'stage-1'
                ],
                plugins: ['babel-root-import']
            }
        }, {
            test: /\.scss$/,
            loaders: ['style', 'css', 'sass']
        }, {
            test: /\.css$/,
            loader: 'style!css'
        }, {
            loader: 'json-loader',
            test: /\.json$/
        }]
    },
    entry: {
        app: ['webpack/hot/dev-server',
            './src/Root'
        ]
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': '"DEV"'
        })
    ],
    target: 'electron-renderer'
};

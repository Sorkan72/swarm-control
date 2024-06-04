const path = require('path');
const { merge } = require('webpack-merge');
const commonConfig = require('./webpack.config.js');

module.exports = merge(commonConfig, {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: {
            directory: path.resolve(__dirname, 'dist')
        },
        open: true, // Open the browser automatically when the server starts
        port: 8080 // Set the port for the development server to listen on
    },
    optimization: {
        runtimeChunk: 'single'
    }
});

const { merge } = require('webpack-merge');
const common = require('./webpack.config.js/index.js');

module.exports = merge(common, {
    mode: 'production'
});
